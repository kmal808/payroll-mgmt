import React, { useState } from 'react';
import { Calendar, Users, Briefcase } from 'lucide-react';
import { getAllPayrollWeeks } from '../../utils/storage';

export function ReportFilters() {
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedCrew, setSelectedCrew] = useState('all');
  
  const payrollWeeks = getAllPayrollWeeks();
  const crews = [...new Set(payrollWeeks.flatMap(week => 
    week.crews.map(crew => crew.name)
  ))];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Week</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <select 
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              <option value="">All Weeks</option>
              {payrollWeeks.map(week => (
                <option key={week.id} value={week.id}>
                  Week Ending: {week.weekEnding}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Crew</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <select 
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              value={selectedCrew}
              onChange={(e) => setSelectedCrew(e.target.value)}
            >
              <option value="all">All Crews</option>
              {crews.map(crew => (
                <option key={crew} value={crew}>{crew}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}