/**
 * VERIFIED against the live database. Unlike Phase 4, every table this phase needs actually
 * exists with substantial real data: Estimation01 (6396 rows) / Estimation02 (49829 line
 * items) / Estimation01Sql (5940 rows), JobInProgress(Sql) (~425 rows), WorkInProgress(Sql)
 * (33 rows), AssignedJobs(Sql) (1541 rows), salesOrdrStatusHead (17 rows, real status master).
 */
export interface EstimationListItem {
  id: number;
  estimationNo: string | null;
  jobCardNo: string | null;
  customerName: string | null;
  vehNo: string | null;
  staffName: string | null;
  billDate: string | null;
  total: number | null;
  labourTotal: number | null;
  net: number | null;
  approved: boolean;
  rejected: boolean;
  rejectionComment: string | null;
  remarks: string | null;
}

export interface EstimationLine {
  description: string | null;
  qty: number | null;
  unitPrice: number | null;
  labourAmount: number | null;
  amount: number | null;
}

export interface JobListItem {
  id: number;
  ordr: string;
  date: string | null;
  statusId: number | null;
  status: string | null;
  statusDescription: string | null;
  staffName: string | null;
  vehNo: string | null;
  customerName: string | null;
  closed: boolean;
  finished: boolean;
  remarks: string | null;
}

export interface WorkInProgressItem {
  id: number;
  ordr: string | null;
  empName: string | null;
  date: string | null;
  activityCode: string | null;
  loggedIn: string | null;
  loggedOut: string | null;
  workDescription: string | null;
  completed: boolean;
  cancelled: boolean;
  status: string | null;
  totalTime: string | null;
}

export interface AssignedJobItem {
  dtlId: number;
  ordr: string;
  empName: string | null;
  dateOfAssign: string | null;
  completed: boolean;
  cancelled: boolean;
  status: string | null;
}

export interface JobStatus {
  statusId: number;
  description: string;
  finishedStatus: boolean;
  partsNotAvailable: boolean;
  inProgress: boolean;
  foreColour: string | null;
  backColour: string | null;
  assigned: boolean;
  approved: boolean;
  sortOrder: number | null;
}
