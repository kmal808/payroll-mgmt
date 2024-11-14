import React, { useState } from 'react'
import { PlusCircle, MinusCircle, Save, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { CrewMember, Crew, PayrollWeek } from '../types/payroll'
import { payroll } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export function PayrollForm() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [payrollWeek, setPayrollWeek] = useState<PayrollWeek>({
    id: uuidv4(),
    weekEnding: new Date().toISOString().split('T')[0],
    crews: [
      {
        id: uuidv4(),
        name: 'Crew 1',
        members: [
          {
            id: uuidv4(),
            name: '',
            dailyPay: {},
            reimbursement: 0,
          },
        ],
      },
    ],
    managerSignature: '',
    signatureDate: '',
  })

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const addCrew = () => {
    setPayrollWeek((prev) => ({
      ...prev,
      crews: [
        ...prev.crews,
        {
          id: uuidv4(),
          name: `Crew ${prev.crews.length + 1}`,
          members: [],
        },
      ],
    }))
  }

  const addCrewMember = (crewId: string) => {
    setPayrollWeek((prev) => ({
      ...prev,
      crews: prev.crews.map((crew) => {
        if (crew.id === crewId) {
          return {
            ...crew,
            members: [
              ...crew.members,
              {
                id: uuidv4(),
                name: '',
                dailyPay: {},
                reimbursement: 0,
              },
            ],
          }
        }
        return crew
      }),
    }))
  }

  const updateMemberName = (crewId: string, memberId: string, name: string) => {
    setPayrollWeek((prev) => ({
      ...prev,
      crews: prev.crews.map((crew) => {
        if (crew.id === crewId) {
          return {
            ...crew,
            members: crew.members.map((member) => {
              if (member.id === memberId) {
                return { ...member, name }
              }
              return member
            }),
          }
        }
        return crew
      }),
    }))
  }

  const updateDailyPay = (
    crewId: string,
    memberId: string,
    day: string,
    amount: number
  ) => {
    setPayrollWeek((prev) => ({
      ...prev,
      crews: prev.crews.map((crew) => {
        if (crew.id === crewId) {
          return {
            ...crew,
            members: crew.members.map((member) => {
              if (member.id === memberId) {
                return {
                  ...member,
                  dailyPay: { ...member.dailyPay, [day]: amount },
                }
              }
              return member
            }),
          }
        }
        return crew
      }),
    }))
  }

  const updateReimbursement = (
    crewId: string,
    memberId: string,
    amount: number
  ) => {
    setPayrollWeek((prev) => ({
      ...prev,
      crews: prev.crews.map((crew) => {
        if (crew.id === crewId) {
          return {
            ...crew,
            members: crew.members.map((member) => {
              if (member.id === memberId) {
                return { ...member, reimbursement: amount }
              }
              return member
            }),
          }
        }
        return crew
      }),
    }))
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      await payroll.create(payrollWeek)
      navigate('/reports')
    } catch (err) {
      setError('Failed to save payroll data. Please try again.')
      console.error('Error saving payroll:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeMember = (crewId: string, memberId: string) => {
    setPayrollWeek((prev) => ({
      ...prev,
      crews: prev.crews.map((crew) => {
        if (crew.id === crewId) {
          return {
            ...crew,
            members: crew.members.filter((member) => member.id !== memberId),
          }
        }
        return crew
      }),
    }))
  }

  const removeCrew = (crewId: string) => {
    setPayrollWeek((prev) => ({
      ...prev,
      crews: prev.crews.filter((crew) => crew.id !== crewId),
    }))
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold text-gray-900'>
          Weekly Payroll Entry
        </h1>
        <div className='space-x-3'>
          <input
            type='date'
            className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md'
            value={payrollWeek.weekEnding}
            onChange={(e) =>
              setPayrollWeek((prev) => ({
                ...prev,
                weekEnding: e.target.value,
              }))
            }
          />
          <button
            onClick={addCrew}
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700'>
            <PlusCircle className='mr-2 h-4 w-4' />
            Add Crew
          </button>
        </div>
      </div>

      {payrollWeek.crews.map((crew) => (
        <div key={crew.id} className='bg-white shadow rounded-lg p-6'>
          <div className='flex justify-between items-center mb-4'>
            <div className='flex items-center space-x-4'>
              <input
                type='text'
                className='text-xl font-medium text-gray-900 border-none focus:ring-0'
                value={crew.name}
                onChange={(e) => {
                  setPayrollWeek((prev) => ({
                    ...prev,
                    crews: prev.crews.map((c) =>
                      c.id === crew.id ? { ...c, name: e.target.value } : c
                    ),
                  }))
                }}
              />
              <button
                onClick={() => removeCrew(crew.id)}
                className='text-red-600 hover:text-red-700'>
                <Trash2 className='h-5 w-5' />
              </button>
            </div>
            <button
              onClick={() => addCrewMember(crew.id)}
              className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
              <PlusCircle className='mr-2 h-4 w-4' />
              Add Member
            </button>
          </div>

          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead>
                <tr>
                  <th className='px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Employee Name
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className='px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      {day}
                    </th>
                  ))}
                  <th className='px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Reimbursement
                  </th>
                  <th className='px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Total
                  </th>
                  <th className='px-6 py-3 bg-gray-50'></th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {crew.members.map((member) => (
                  <tr key={member.id}>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <input
                        type='text'
                        className='block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='Employee name'
                        value={member.name}
                        onChange={(e) =>
                          updateMemberName(crew.id, member.id, e.target.value)
                        }
                      />
                    </td>
                    {days.map((day) => (
                      <td key={day} className='px-6 py-4 whitespace-nowrap'>
                        <input
                          type='number'
                          className='block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                          placeholder='0.00'
                          value={member.dailyPay[day] || ''}
                          onChange={(e) =>
                            updateDailyPay(
                              crew.id,
                              member.id,
                              day,
                              Number(e.target.value)
                            )
                          }
                        />
                      </td>
                    ))}
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <input
                        type='number'
                        className='block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        placeholder='0.00'
                        value={member.reimbursement}
                        onChange={(e) =>
                          updateReimbursement(
                            crew.id,
                            member.id,
                            Number(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      $
                      {Object.values(member.dailyPay).reduce(
                        (a, b) => a + b,
                        0
                      ) + member.reimbursement}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <button
                        onClick={() => removeMember(crew.id, member.id)}
                        className='text-red-600 hover:text-red-900'>
                        <MinusCircle className='h-5 w-5' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className='mt-8 bg-white shadow rounded-lg p-6'>
        {error && (
          <div className='mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded'>
            {error}
          </div>
        )}

        <div className='flex justify-between items-center'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Manager Signature
            </label>
            <input
              type='text'
              className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              placeholder='Type your name'
              value={payrollWeek.managerSignature}
              onChange={(e) =>
                setPayrollWeek((prev) => ({
                  ...prev,
                  managerSignature: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Date
            </label>
            <input
              type='date'
              className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              value={payrollWeek.signatureDate}
              onChange={(e) =>
                setPayrollWeek((prev) => ({
                  ...prev,
                  signatureDate: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className='mt-4 flex justify-end space-x-3'>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}>
            <Save className='mr-2 h-4 w-4' />
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
