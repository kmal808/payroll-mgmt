import React from 'react';
import { User } from 'lucide-react';

export function EmployeePortal() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Employee Portal</h3>
        <p className="mt-1 text-sm text-gray-500">Coming soon</p>
      </div>
    </div>
  );
}