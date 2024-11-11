export interface CrewMember {
  id: string;
  name: string;
  dailyPay: { [key: string]: number };
  reimbursement: number;
}

export interface Crew {
  id: string;
  name: string;
  members: CrewMember[];
}

export interface PayrollWeek {
  id: string;
  weekEnding: string;
  crews: Crew[];
  managerSignature?: string;
  signatureDate?: string;
}