import React, { useState } from 'react';
import { PlusCircle, MinusCircle, Save, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CrewMember, Crew, PayrollWeek } from '../types/payroll';
import { payroll } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export function PayrollForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payrollWeek, setPayrollWeek] = useState<PayrollWeek>({
    id: uuidv4(),
    weekEnding: new Date().toISOString().split('T')[0],
    crews: [{
      id: uuidv4(),
      name: 'Crew 1',
      members: [{
        id: uuidv4(),
        name: '',
        dailyPay: {},
        reimbursement: 0
      }]
    }],
    managerSignature: '',
    signatureDate: ''
  });

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // ... (keep all the existing state update functions)

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await payroll.create(payrollWeek);
      navigate('/reports');
    } catch (err) {
      setError('Failed to save payroll data. Please try again.');
      console.error('Error saving payroll:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (keep the rest of the component's JSX, but update the save button):

  return (
    <div className="space-y-6">
      {/* ... existing JSX ... */}
      
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          {/* ... signature inputs ... */}
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}