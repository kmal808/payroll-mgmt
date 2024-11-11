import React from 'react';
import { WeeklyReport } from './reports/WeeklyReport';
import { ReportFilters } from './reports/ReportFilters';
import { FileText, Download, Mail } from 'lucide-react';

export function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Payroll Reports</h1>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Mail className="mr-2 h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      <ReportFilters />
      <WeeklyReport />
    </div>
  );
}