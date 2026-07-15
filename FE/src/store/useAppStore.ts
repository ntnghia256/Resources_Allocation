import { create } from 'zustand';
import axios from 'axios';
import type { Employee, Project, Allocation, EmployeeWorkload } from '../types';

// Helper: Normalize dd/MM/yyyy date from backend to yyyy-MM-dd for HTML5 input
const parseBackendDate = (dateStr: string): string => {
  if (!dateStr) return '';
  if (dateStr.includes('-')) return dateStr; // Already yyyy-MM-dd
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

// Rich Mock Data for Offline Sandbox Mode
const INITIAL_MOCK_EMPLOYEES: Employee[] = [
  { employeeId: 1, employeeCode: 'EMP001', fullName: 'Tuấn Hồ Anh', email: 'tuanha@company.com', role: 'Senior Developer', department: 'FSOFT-Q1' },
  { employeeId: 2, employeeCode: 'EMP002', fullName: 'Lê Thanh Nam', email: 'namlt@company.com', role: 'Backend Developer', department: 'FSOFT-Q2' },
  { employeeId: 3, employeeCode: 'EMP003', fullName: 'Nguyễn Thị Lan', email: 'lannt@company.com', role: 'Frontend Developer', department: 'FSOFT-Q1' },
  { employeeId: 4, employeeCode: 'EMP004', fullName: 'Trần Đức Huy', email: 'huytd@company.com', role: 'Project Manager', department: 'FSOFT-Q3' },
  { employeeId: 5, employeeCode: 'EMP005', fullName: 'Phạm Minh Hoàng', email: 'hoangpm@company.com', role: 'DevOps Engineer', department: 'FSOFT-Q1' },
];

const INITIAL_MOCK_PROJECTS: Project[] = [
  { projectId: 1, projectCode: 'PRJ001', projectName: 'NCG Project', customer: 'Customer Tokyo', status: 'ACTIVE' },
  { projectId: 2, projectCode: 'PRJ002', projectName: 'GRID Platform', customer: 'Customer Munich', status: 'PLANNING' },
  { projectId: 3, projectCode: 'PRJ003', projectName: 'Internal AI Tool', customer: 'FPT Internal', status: 'ACTIVE' },
  { projectId: 4, projectCode: 'PRJ004', projectName: 'Old Migration Legacy', customer: 'Customer Texas', status: 'COMPLETED' },
];

const INITIAL_MOCK_ALLOCATIONS: Allocation[] = [
  { allocationId: 1, employeeId: 1, projectId: 1, allocationPercent: 50, roleInProject: 'Backend Lead', startDate: '2026-01-01', endDate: '2026-12-31' },
  { allocationId: 2, employeeId: 1, projectId: 3, allocationPercent: 30, roleInProject: 'AI Developer', startDate: '2026-03-01', endDate: '2026-10-31' },
  { allocationId: 3, employeeId: 2, projectId: 1, allocationPercent: 60, roleInProject: 'Spring Boot Developer', startDate: '2026-01-01', endDate: '2026-12-31' },
  { allocationId: 4, employeeId: 3, projectId: 3, allocationPercent: 80, roleInProject: 'React Frontend Developer', startDate: '2026-02-15', endDate: '2026-09-30' },
  { allocationId: 5, employeeId: 4, projectId: 1, allocationPercent: 40, roleInProject: 'Project Manager', startDate: '2026-01-01', endDate: '2026-12-31' },
];

// Helper: Calculate reports locally from lists (for Mock Mode)
const calculateLocalReports = (employeesList: Employee[], allocationsList: Allocation[]) => {
  const workloads = employeesList.map(emp => {
    const empAllocs = allocationsList.filter(a => a.employeeId === emp.employeeId);
    const total = empAllocs.reduce((sum, a) => sum + a.allocationPercent, 0);
    return {
      employeeId: emp.employeeId!,
      employeeName: emp.fullName,
      totalAllocation: total,
      available: Math.max(0, 100 - total)
    };
  });

  return {
    utilizationReport: workloads,
    availableReport: workloads.filter(wl => wl.totalAllocation < 100),
    overloadedReport: workloads.filter(wl => wl.totalAllocation > 90)
  };
};

interface AppState {
  // Theme state
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  initTheme: () => void;

  // Connection State
  usingMockData: boolean;
  setUsingMockData: (val: boolean) => void;

  // Core Lists
  employees: Employee[];
  projects: Project[];
  allocations: Allocation[];
  
  // Reports Lists (populated either from backend or calculated locally)
  utilizationReport: EmployeeWorkload[];
  availableReport: EmployeeWorkload[];
  overloadedReport: EmployeeWorkload[];

  // Loading & Error States
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  setError: (err: string | null) => void;
  setSuccessMessage: (msg: string | null) => void;

  // Actions
  fetchInitialData: () => Promise<void>;
  refreshReports: () => Promise<void>;
  
  // Employee Actions
  addEmployee: (employee: Employee) => Promise<boolean>;
  updateEmployee: (id: number, employee: Employee) => Promise<boolean>;
  
  // Project Actions
  addProject: (project: Project) => Promise<boolean>;
  updateProject: (id: number, project: Project) => Promise<boolean>;

  // Allocation Actions
  addAllocation: (allocation: Allocation) => Promise<boolean>;
  updateAllocation: (id: number, allocation: Allocation) => Promise<boolean>;
  deleteAllocation: (id: number) => Promise<boolean>;

  // Computed Workloads
  getEmployeeWorkload: (employeeId: number) => EmployeeWorkload;
  getEmployeeAllocations: (employeeId: number) => Allocation[];
  getProjectAllocations: (projectId: number) => Allocation[];

  // AI Mocking & API calls
  aiRecommendation: (prompt: string) => Promise<{ recommendedResources: { employee: string; available: number }[] }>;
  aiRiskDetection: (prompt: string) => Promise<{ risks: string[]; text: string }>;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'light',
  usingMockData: true, // Default to mock data, will sense backend on initialization
  employees: INITIAL_MOCK_EMPLOYEES,
  projects: INITIAL_MOCK_PROJECTS,
  allocations: INITIAL_MOCK_ALLOCATIONS,
  utilizationReport: [],
  availableReport: [],
  overloadedReport: [],
  loading: false,
  error: null,
  successMessage: null,

  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: nextTheme });
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  initTheme: () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  setUsingMockData: (val) => set({ usingMockData: val }),
  setError: (err) => set({ error: err }),
  setSuccessMessage: (msg) => set({ successMessage: msg }),

  fetchInitialData: async () => {
    set({ loading: true, error: null });
    try {
      // Fetch core lists
      const [empRes, projRes, allocRes] = await Promise.all([
        axios.get('/api/employees'),
        axios.get('/api/projects'),
        axios.get('/api/allocations'),
      ]);

      // Normalize allocation dates and properties
      const normalizedAllocations = allocRes.data.map((alloc: any) => ({
        allocationId: alloc.allocationId,
        employeeId: alloc.employee?.employeeId || alloc.employeeId,
        projectId: alloc.project?.projectId || alloc.projectId,
        allocationPercent: alloc.allocationPercent,
        roleInProject: alloc.roleInProject,
        startDate: parseBackendDate(alloc.startDate),
        endDate: parseBackendDate(alloc.endDate),
        employeeName: alloc.employee?.fullName,
        employeeCode: alloc.employee?.employeeCode,
        projectName: alloc.project?.projectName,
        projectCode: alloc.project?.projectCode
      }));

      // Set online mode
      set({
        employees: empRes.data,
        projects: projRes.data,
        allocations: normalizedAllocations,
        usingMockData: false,
      });

      // Fetch reports from Backend
      await get().refreshReports();
      set({ loading: false });

    } catch (err) {
      console.warn('Backend server connection failed. Running in sandbox (Mock Data) mode.', err);
      
      // Calculate local reports from Mock Data lists
      const localReports = calculateLocalReports(INITIAL_MOCK_EMPLOYEES, INITIAL_MOCK_ALLOCATIONS);

      set({
        employees: INITIAL_MOCK_EMPLOYEES,
        projects: INITIAL_MOCK_PROJECTS,
        allocations: INITIAL_MOCK_ALLOCATIONS,
        ...localReports,
        usingMockData: true,
        loading: false
      });
    }
  },

  refreshReports: async () => {
    const { usingMockData, employees, allocations } = get();
    if (usingMockData) {
      const localReports = calculateLocalReports(employees, allocations);
      set({ ...localReports });
      return;
    }

    try {
      const [utilRes, availRes, overloadRes] = await Promise.all([
        axios.get('/api/reports/utilization'),
        axios.get('/api/reports/available'),
        axios.get('/api/reports/overloaded'),
      ]);

      // Map backend report DTOs into standard EmployeeWorkload structures
      const utilizationReport = utilRes.data.map((item: any) => ({
        employeeId: item.employeeId,
        employeeName: item.employeeName,
        totalAllocation: item.totalAllocation,
        available: Math.max(0, 100 - item.totalAllocation)
      }));

      const availableReport = availRes.data.map((item: any) => ({
        employeeId: item.employeeId,
        employeeName: item.employeeName,
        totalAllocation: 100 - item.availableAllocation,
        available: item.availableAllocation
      }));

      const overloadedReport = overloadRes.data.map((item: any) => ({
        employeeId: item.employeeId,
        employeeName: item.employeeName,
        totalAllocation: item.totalAllocation,
        available: Math.max(0, 100 - item.totalAllocation)
      }));

      set({
        utilizationReport,
        availableReport,
        overloadedReport
      });
    } catch (err) {
      console.error('Failed to sync reports from Backend', err);
    }
  },

  addEmployee: async (employee) => {
    set({ loading: true, error: null });
    const { usingMockData, employees } = get();
    
    if (usingMockData) {
      const newId = employees.length ? Math.max(...employees.map(e => e.employeeId || 0)) + 1 : 1;
      const newEmployee = { ...employee, employeeId: newId };
      const nextEmployees = [...employees, newEmployee];
      
      set({ employees: nextEmployees, loading: false, successMessage: 'Đã thêm nhân viên thành công (Mock)' });
      await get().refreshReports();
      return true;
    }

    try {
      const res = await axios.post('/api/employees', employee);
      set({ employees: [...employees, res.data], loading: false, successMessage: 'Đã thêm nhân viên thành công' });
      await get().refreshReports();
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Không thể thêm nhân viên. Vui lòng kiểm tra lại.';
      set({ error: errMsg, loading: false });
      return false;
    }
  },

  updateEmployee: async (id, employee) => {
    set({ loading: true, error: null });
    const { usingMockData, employees } = get();

    if (usingMockData) {
      const nextEmployees = employees.map(e => e.employeeId === id ? { ...employee, employeeId: id } : e);
      set({
        employees: nextEmployees,
        loading: false,
        successMessage: 'Đã cập nhật thông tin nhân viên (Mock)'
      });
      await get().refreshReports();
      return true;
    }

    // Backend doesn't support employee updates (save is insert only if it checks code uniqueness)
    set({ 
      error: 'Backend API hiện tại không hỗ trợ cập nhật thông tin nhân sự (Chức năng chỉ hoạt động ở Sandbox).', 
      loading: false 
    });
    return false;
  },

  addProject: async (project) => {
    set({ loading: true, error: null });
    const { usingMockData, projects } = get();

    if (usingMockData) {
      const newId = projects.length ? Math.max(...projects.map(p => p.projectId || 0)) + 1 : 1;
      const newProject = { ...project, projectId: newId };
      set({ projects: [...projects, newProject], loading: false, successMessage: 'Đã thêm dự án thành công (Mock)' });
      return true;
    }

    try {
      const res = await axios.post('/api/projects', project);
      set({ projects: [...projects, res.data], loading: false, successMessage: 'Đã thêm dự án thành công' });
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Không thể thêm dự án.';
      set({ error: errMsg, loading: false });
      return false;
    }
  },

  updateProject: async (id, project) => {
    set({ loading: true, error: null });
    const { usingMockData, projects } = get();

    if (usingMockData) {
      set({
        projects: projects.map(p => p.projectId === id ? { ...project, projectId: id } : p),
        loading: false,
        successMessage: 'Đã cập nhật dự án thành công (Mock)'
      });
      return true;
    }

    try {
      const res = await axios.put(`/api/projects/${id}`, project);
      set({
        projects: projects.map(p => p.projectId === id ? res.data : p),
        loading: false,
        successMessage: 'Đã cập nhật dự án thành công'
      });
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Không thể cập nhật dự án.';
      set({ error: errMsg, loading: false });
      return false;
    }
  },

  addAllocation: async (allocation) => {
    set({ loading: true, error: null });
    const { usingMockData, allocations, projects, getEmployeeWorkload } = get();

    // Client-side Validation: Business Rule 1 (0 < allocation <= 100)
    if (allocation.allocationPercent <= 0 || allocation.allocationPercent > 100) {
      set({ error: 'Tỷ lệ phân bổ phải lớn hơn 0 và không vượt quá 100%.', loading: false });
      return false;
    }

    // Client-side Validation: Business Rule 3 (Không phân bổ vào dự án COMPLETED)
    const targetProj = projects.find(p => p.projectId === Number(allocation.projectId));
    if (!targetProj) {
      set({ error: 'Dự án không tồn tại.', loading: false });
      return false;
    }
    if (targetProj.status === 'COMPLETED') {
      set({ error: 'Không cho phép phân bổ nhân sự vào dự án đã HOÀN THÀNH (COMPLETED).', loading: false });
      return false;
    }

    // Client-side Validation: Business Rule 2 (Tổng allocation <= 100%)
    const currentWorkload = getEmployeeWorkload(Number(allocation.employeeId));
    if (currentWorkload.totalAllocation + allocation.allocationPercent > 100) {
      set({ 
        error: `Tổng tỷ lệ phân bổ của nhân viên này sẽ vượt quá 100% (${currentWorkload.totalAllocation}% hiện tại + ${allocation.allocationPercent}% yêu cầu = ${currentWorkload.totalAllocation + allocation.allocationPercent}%).`, 
        loading: false 
      });
      return false;
    }

    if (usingMockData) {
      const newId = allocations.length ? Math.max(...allocations.map(a => a.allocationId || 0)) + 1 : 1;
      const newAlloc = { ...allocation, allocationId: newId };
      const nextAllocations = [...allocations, newAlloc];
      
      set({ allocations: nextAllocations, loading: false, successMessage: 'Phân bổ nhân sự thành công (Mock)' });
      await get().refreshReports();
      return true;
    }

    try {
      await axios.post('/api/allocations', allocation);
      // Refresh list from Backend
      const fresh = await axios.get('/api/allocations');
      const normalizedAllocations = fresh.data.map((alloc: any) => ({
        allocationId: alloc.allocationId,
        employeeId: alloc.employee?.employeeId || alloc.employeeId,
        projectId: alloc.project?.projectId || alloc.projectId,
        allocationPercent: alloc.allocationPercent,
        roleInProject: alloc.roleInProject,
        startDate: parseBackendDate(alloc.startDate),
        endDate: parseBackendDate(alloc.endDate),
        employeeName: alloc.employee?.fullName,
        employeeCode: alloc.employee?.employeeCode,
        projectName: alloc.project?.projectName,
        projectCode: alloc.project?.projectCode
      }));

      set({ allocations: normalizedAllocations, loading: false, successMessage: 'Phân bổ nhân sự thành công' });
      await get().refreshReports();
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Không thể tạo phân bổ. Lỗi hệ thống.';
      set({ error: errMsg, loading: false });
      return false;
    }
  },

  updateAllocation: async (id, allocation) => {
    set({ loading: true, error: null });
    const { usingMockData, allocations, projects, getEmployeeWorkload } = get();

    // Client-side Validation: Business Rule 1 (0 < allocation <= 100)
    if (allocation.allocationPercent <= 0 || allocation.allocationPercent > 100) {
      set({ error: 'Tỷ lệ phân bổ phải lớn hơn 0 và không vượt quá 100%.', loading: false });
      return false;
    }

    // Client-side Validation: Business Rule 3 (Không phân bổ vào dự án COMPLETED)
    const targetProj = projects.find(p => p.projectId === Number(allocation.projectId));
    if (!targetProj) {
      set({ error: 'Dự án không tồn tại.', loading: false });
      return false;
    }
    if (targetProj.status === 'COMPLETED') {
      set({ error: 'Không cho phép phân bổ nhân sự vào dự án đã HOÀN THÀNH (COMPLETED).', loading: false });
      return false;
    }

    // Client-side Validation: Business Rule 2 (Tổng allocation <= 100% excluding this one)
    const currentWorkload = getEmployeeWorkload(Number(allocation.employeeId));
    const previousAlloc = allocations.find(a => a.allocationId === id);
    const prevPercent = previousAlloc ? previousAlloc.allocationPercent : 0;
    const finalCalculated = currentWorkload.totalAllocation - prevPercent + allocation.allocationPercent;
    
    if (finalCalculated > 100) {
      set({ 
        error: `Tổng tỷ lệ phân bổ của nhân viên này sẽ vượt quá 100% (Hiện tại sau khi cập nhật là ${finalCalculated}%).`, 
        loading: false 
      });
      return false;
    }

    if (usingMockData) {
      const nextAllocations = allocations.map(a => a.allocationId === id ? { ...allocation, allocationId: id } : a);
      set({
        allocations: nextAllocations,
        loading: false,
        successMessage: 'Cập nhật phân bổ thành công (Mock)'
      });
      await get().refreshReports();
      return true;
    }

    try {
      await axios.put(`/api/allocations/${id}`, allocation);
      const fresh = await axios.get('/api/allocations');
      const normalizedAllocations = fresh.data.map((alloc: any) => ({
        allocationId: alloc.allocationId,
        employeeId: alloc.employee?.employeeId || alloc.employeeId,
        projectId: alloc.project?.projectId || alloc.projectId,
        allocationPercent: alloc.allocationPercent,
        roleInProject: alloc.roleInProject,
        startDate: parseBackendDate(alloc.startDate),
        endDate: parseBackendDate(alloc.endDate),
        employeeName: alloc.employee?.fullName,
        employeeCode: alloc.employee?.employeeCode,
        projectName: alloc.project?.projectName,
        projectCode: alloc.project?.projectCode
      }));

      set({ allocations: normalizedAllocations, loading: false, successMessage: 'Cập nhật phân bổ thành công' });
      await get().refreshReports();
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Không thể cập nhật phân bổ.';
      set({ error: errMsg, loading: false });
      return false;
    }
  },

  deleteAllocation: async (id) => {
    set({ loading: true, error: null });
    const { usingMockData, allocations } = get();

    if (usingMockData) {
      const nextAllocations = allocations.filter(a => a.allocationId !== id);
      set({
        allocations: nextAllocations,
        loading: false,
        successMessage: 'Đã hủy phân bổ nhân sự thành công (Mock)'
      });
      await get().refreshReports();
      return true;
    }

    try {
      await axios.delete(`/api/allocations/${id}`);
      set({
        allocations: allocations.filter(a => a.allocationId !== id),
        loading: false,
        successMessage: 'Đã hủy phân bổ nhân sự thành công'
      });
      await get().refreshReports();
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Không thể xóa phân bổ nhân sự.';
      set({ error: errMsg, loading: false });
      return false;
    }
  },

  getEmployeeWorkload: (employeeId) => {
    const { employees, allocations } = get();
    const emp = employees.find(e => e.employeeId === employeeId);
    const empAllocations = allocations.filter(a => a.employeeId === employeeId);
    const totalAlloc = empAllocations.reduce((sum, a) => sum + a.allocationPercent, 0);
    return {
      employeeId,
      employeeName: emp ? emp.fullName : 'Unknown',
      totalAllocation: totalAlloc,
      available: Math.max(0, 100 - totalAlloc)
    };
  },

  getEmployeeAllocations: (employeeId) => {
    return get().allocations.filter(a => a.employeeId === employeeId);
  },

  getProjectAllocations: (projectId) => {
    return get().allocations.filter(a => a.projectId === projectId);
  },

  aiRecommendation: async (prompt) => {
    set({ loading: true, error: null });
    const { usingMockData, employees, getEmployeeWorkload } = get();
    
    if (usingMockData) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Sim delay
      
      const query = prompt.toLowerCase();
      let matchedRole = '';
      if (query.includes('java') || query.includes('backend') || query.includes('dev')) matchedRole = 'Developer';
      if (query.includes('devops')) matchedRole = 'DevOps';
      if (query.includes('front')) matchedRole = 'Frontend';

      let minAvailable = 0;
      const capMatch = query.match(/(\d+)\s*%/);
      if (capMatch) {
        minAvailable = parseInt(capMatch[1], 10);
      }

      const recs = employees
        .map(emp => {
          const wl = getEmployeeWorkload(emp.employeeId!);
          return {
            employee: emp.fullName,
            role: emp.role,
            available: wl.available
          };
        })
        .filter(emp => {
          const matchesRole = matchedRole ? emp.role.toLowerCase().includes(matchedRole.toLowerCase()) : true;
          const matchesCap = emp.available >= minAvailable;
          return matchesRole && matchesCap;
        })
        .map(emp => ({
          employee: emp.employee,
          available: emp.available
        }));

      set({ loading: false });
      return { recommendedResources: recs };
    }

    try {
      const res = await axios.post('/api/ai/recommend', { prompt });
      set({ loading: false });
      return res.data;
    } catch (err: any) {
      console.error('AI Recommend API failed', err);
      const errMsg = err.response?.data?.message || 'Không thể thực hiện đề xuất từ AI.';
      set({ error: errMsg, loading: false });
      return { recommendedResources: [] };
    }
  },

  aiRiskDetection: async (prompt) => {
    set({ loading: true, error: null });
    const { usingMockData, employees, getEmployeeWorkload } = get();

    if (usingMockData) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const allWls = employees.map(e => getEmployeeWorkload(e.employeeId!));
      const totalUsedCap = allWls.reduce((sum, w) => sum + w.totalAllocation, 0);
      const avgCapacity = Math.round(totalUsedCap / Math.max(1, employees.length));
      const availableResources = allWls.filter(w => w.available >= 50);

      const risks: string[] = [];
      if (avgCapacity > 75) {
        risks.push(`Team đang sử dụng trung bình ${avgCapacity}% capacity (workload rất cao).`);
      } else {
        risks.push(`Team đang sử dụng trung bình ${avgCapacity}% capacity.`);
      }

      if (availableResources.length < 2) {
        risks.push(`Chỉ còn ${availableResources.length} nhân sự có năng lực khả dụng trên 50% để phân bổ.`);
      } else {
        risks.push(`Còn lại ${availableResources.length} nhân sự có năng lực khả dụng trên 50% để sẵn sàng làm dự án.`);
      }

      set({ loading: false });
      return {
        risks,
        text: `Phân tích rủi ro dựa trên truy vấn "${prompt}":\n- ${risks.join('\n- ')}`
      };
    }

    try {
      const res = await axios.post('/api/ai/risk-detect', { prompt });
      const reportText = res.data;
      
      // Parse plain text response lines into risks array
      const risks = reportText
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.startsWith('-') || line.toLowerCase().includes('risk') || line.length > 0)
        .map((line: string) => line.replace(/^-\s*/, ''));

      set({ loading: false });
      return {
        risks: risks.length ? risks : [reportText],
        text: reportText
      };
    } catch (err: any) {
      console.error('AI Risk Detection API failed', err);
      const errMsg = err.response?.data?.message || 'Không thể kết nối dịch vụ phân tích rủi ro.';
      set({ error: errMsg, loading: false });
      return { risks: ['Lỗi kết nối AI Backend'], text: 'Không thể phân tích rủi ro lúc này.' };
    }
  }
}));
