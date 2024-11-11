import React, { useEffect, useState } from 'react';
import { payroll } from '../../lib/api';
import { PayrollWeek } from '../../types/payroll';

export function WeeklyReport() {
  const [payrollWeeks, setPayrollWeeks] = useState<PayrollWeek[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        const data = await payroll.getAll();
        setPayrollWeeks(data);
      } catch (err) {
        setError('Failed to load payroll data');
        console.error('Error fetching payroll data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayrollData();
  }, []);

  const calculateTotalPay = (payrollWeek: PayrollWeek) => {
    return payrollWeek.crews.reduce((crewTotal, crew) => {
      return crewTotal + crew.members.reduce((memberTotal, member) => {
        const dailyTotal = Object.values(member.dailyPay).reduce((sum, pay) => sum + pay, 0);
        return memberTotal + dailyTotal + member.reimbursement;
      }, 0);
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <p className="text-gray-500">Loading payroll data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (payrollWeeks.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <p className="text-gray-500">No payroll data available yet.</p>
      </div>
    );
  }

  // ... (keep the rest of the component's JSX unchanged)
}