// This file will be deprecated once we fully migrate to API
// Keeping it temporarily for backup/reference

import { PayrollWeek } from '../types/payroll';

const STORAGE_KEY = 'payroll_data';

export function savePayrollWeek(payrollWeek: PayrollWeek): void {
  const existingData = getAllPayrollWeeks();
  const index = existingData.findIndex(week => week.id === payrollWeek.id);
  
  if (index !== -1) {
    existingData[index] = payrollWeek;
  } else {
    existingData.push(payrollWeek);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
}

export function getAllPayrollWeeks(): PayrollWeek[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getPayrollWeek(id: string): PayrollWeek | undefined {
  const allWeeks = getAllPayrollWeeks();
  return allWeeks.find(week => week.id === id);
}

export function deletePayrollWeek(id: string): void {
  const allWeeks = getAllPayrollWeeks();
  const filteredWeeks = allWeeks.filter(week => week.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredWeeks));
}