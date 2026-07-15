export interface Employee {
  employeeId?: number;
  employeeCode: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
}

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED';

export interface Project {
  projectId?: number;
  projectCode: string;
  projectName: string;
  customer: string;
  status: ProjectStatus;
}

export interface Allocation {
  allocationId?: number;
  employeeId: number;
  projectId: number;
  allocationPercent: number;
  roleInProject: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  
  // Custom properties populated for UI rendering
  employeeName?: string;
  employeeCode?: string;
  projectCode?: string;
  projectName?: string;
}

export interface EmployeeWorkload {
  employeeId: number;
  employeeName: string;
  totalAllocation: number;
  available: number;
}

export interface AIResourceRecommendation {
  employee: string;
  available: number;
}

export interface AIRecommendationResponse {
  recommendedResources: AIResourceRecommendation[];
}
