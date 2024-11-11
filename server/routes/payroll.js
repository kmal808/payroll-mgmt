import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { pool } from '../db.js';
import { z } from 'zod';

const router = express.Router();

const payrollWeekSchema = z.object({
  weekEnding: z.string(),
  managerSignature: z.string().optional(),
  signatureDate: z.string().optional(),
  crews: z.array(z.object({
    name: z.string(),
    members: z.array(z.object({
      name: z.string(),
      dailyPay: z.record(z.string(), z.number()),
      reimbursement: z.number()
    }))
  }))
});

router.post('/', authenticateToken, async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const payrollData = payrollWeekSchema.parse(req.body);
    
    await client.query('BEGIN');

    // Create payroll week
    const payrollWeekResult = await client.query(
      `INSERT INTO payroll_weeks (week_ending, manager_signature, signature_date, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [payrollData.weekEnding, payrollData.managerSignature, payrollData.signatureDate, req.user.id]
    );

    const payrollWeekId = payrollWeekResult.rows[0].id;

    // Create crews and members
    for (const crew of payrollData.crews) {
      const crewResult = await client.query(
        `INSERT INTO crews (name, payroll_week_id)
         VALUES ($1, $2)
         RETURNING id`,
        [crew.name, payrollWeekId]
      );

      const crewId = crewResult.rows[0].id;

      for (const member of crew.members) {
        const memberResult = await client.query(
          `INSERT INTO crew_members (name, crew_id)
           VALUES ($1, $2)
           RETURNING id`,
          [member.name, crewId]
        );

        const memberId = memberResult.rows[0].id;

        // Insert daily pay
        for (const [day, amount] of Object.entries(member.dailyPay)) {
          await client.query(
            `INSERT INTO daily_pay (crew_member_id, day_of_week, amount)
             VALUES ($1, $2, $3)`,
            [memberId, day, amount]
          );
        }

        // Insert reimbursement
        if (member.reimbursement) {
          await client.query(
            `INSERT INTO reimbursements (crew_member_id, amount)
             VALUES ($1, $2)`,
            [memberId, member.reimbursement]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ id: payrollWeekId });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        pw.id,
        pw.week_ending,
        pw.manager_signature,
        pw.signature_date,
        json_agg(
          json_build_object(
            'id', c.id,
            'name', c.name,
            'members', (
              SELECT json_agg(
                json_build_object(
                  'id', cm.id,
                  'name', cm.name,
                  'dailyPay', (
                    SELECT json_object_agg(
                      dp.day_of_week,
                      dp.amount
                    )
                    FROM daily_pay dp
                    WHERE dp.crew_member_id = cm.id
                  ),
                  'reimbursement', (
                    SELECT COALESCE(SUM(amount), 0)
                    FROM reimbursements r
                    WHERE r.crew_member_id = cm.id
                  )
                )
              )
              FROM crew_members cm
              WHERE cm.crew_id = c.id
            )
          )
        ) as crews
      FROM payroll_weeks pw
      JOIN crews c ON c.payroll_week_id = pw.id
      WHERE pw.created_by = $1
      GROUP BY pw.id
      ORDER BY pw.week_ending DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;