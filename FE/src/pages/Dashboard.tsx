import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card, ProgressBar, Badge } from '../components/UI';
import { Users, FolderGit2, AlertTriangle, BatteryCharging, Search } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    employees, 
    projects, 
    getEmployeeWorkload, 
    usingMockData,
    utilizationReport,
    availableReport,
    overloadedReport
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<'utilization' | 'available' | 'overloaded'>('utilization');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculations for KPI Cards
  const totalEmployees = employees.length;
  
  // Projects by status
  const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
  const planningProjects = projects.filter(p => p.status === 'PLANNING').length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;

  // Calculate workloads for all employees (fallback)
  const workloads = employees.map(emp => getEmployeeWorkload(emp.employeeId!));
  
  // Dynamic report references based on connection state
  const rawUtilization = usingMockData ? workloads : utilizationReport;
  const rawAvailable = usingMockData ? workloads.filter(wl => wl.totalAllocation < 100) : availableReport;
  const rawOverloaded = usingMockData ? workloads.filter(wl => wl.totalAllocation > 90) : overloadedReport;

  // Sorting reports descending
  const currentUtilization = [...rawUtilization].sort((a, b) => b.totalAllocation - a.totalAllocation);
  const availableResources = [...rawAvailable].sort((a, b) => b.available - a.available);
  const overloadedResources = [...rawOverloaded].sort((a, b) => b.totalAllocation - a.totalAllocation);

  // Count overloaded
  const overloadedCount = overloadedResources.length;

  // Average utilization percentage
  const totalUsedCapacity = currentUtilization.reduce((sum, wl) => sum + wl.totalAllocation, 0);
  const avgUtilization = totalEmployees ? Math.round(totalUsedCapacity / totalEmployees) : 0;

  // Filter based on active tab and search term
  const getFilteredReportData = () => {
    let baseData = [];
    if (activeTab === 'utilization') {
      baseData = currentUtilization;
    } else if (activeTab === 'available') {
      baseData = availableResources;
    } else {
      baseData = overloadedResources;
    }

    if (!searchTerm.trim()) return baseData;
    return baseData.filter(item => 
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredData = getFilteredReportData();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Bảng Điều Khiển Hệ Thống
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Theo dõi tổng quan tình trạng sử dụng nguồn lực và phân bổ nhân sự dự án.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Employees */}
        <Card className="flex items-center space-x-4 border-l-4 border-l-blue-600">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tổng Nhân Sự</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-950 dark:text-white">{totalEmployees}</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">nhân viên được quản lý</p>
          </div>
        </Card>

        {/* KPI 2: Projects */}
        <Card className="flex items-center space-x-4 border-l-4 border-l-indigo-600">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
            <FolderGit2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Dự Án Đang Chạy</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-950 dark:text-white">
              {activeProjects} <span className="text-xs font-normal text-slate-400">/ {projects.length}</span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {planningProjects} chuẩn bị, {completedProjects} hoàn thành
            </p>
          </div>
        </Card>

        {/* KPI 3: Overloaded */}
        <Card className="flex items-center space-x-4 border-l-4 border-l-red-500">
          <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl text-red-500 dark:text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Nhân Sự Quá Tải</p>
            <h3 className={`text-2xl font-bold mt-1 ${overloadedCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
              {overloadedCount}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">workload vượt ngưỡng 90%</p>
          </div>
        </Card>

        {/* KPI 4: Avg Utilization */}
        <Card className="flex items-center space-x-4 border-l-4 border-l-emerald-500">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
            <BatteryCharging className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Hiệu Suất Sử Dụng</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-950 dark:text-white">{avgUtilization}%</h3>
            <div className="w-24 mt-1.5">
              <ProgressBar percent={avgUtilization} />
            </div>
          </div>
        </Card>
      </div>

      {/* Reports Section Card */}
      <Card className="overflow-hidden">
        {/* Reports Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 space-y-4 sm:space-y-0">
          <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl self-start">
            <button
              onClick={() => { setActiveTab('utilization'); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === 'utilization'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              Hiệu Suất Tổng Quan
            </button>
            <button
              onClick={() => { setActiveTab('available'); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === 'available'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              Nguồn Lực Rảnh Rỗi ({availableResources.length})
            </button>
            <button
              onClick={() => { setActiveTab('overloaded'); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === 'overloaded'
                  ? 'bg-red-500 text-white shadow-sm shadow-red-200 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              Cảnh Báo Quá Tải ({overloadedResources.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Tìm theo tên nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:[color-scheme:dark]"
            />
          </div>
        </div>

        {/* Tab Title description */}
        <div className="mb-4">
          {activeTab === 'utilization' && (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              * Báo cáo này thống kê tổng tỷ lệ phân bổ của tất cả nhân sự đang tham gia các dự án trong hệ thống.
            </p>
          )}
          {activeTab === 'available' && (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              * Danh sách nhân sự có tổng phân bổ dưới 100%, sẵn sàng nhận thêm việc (Available &gt; 0%).
            </p>
          )}
          {activeTab === 'overloaded' && (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              * Danh sách nhân sự đang phải làm việc quá công suất quy định (Allocation &gt; 90%). Cần được PM lưu ý.
            </p>
          )}
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider text-xs font-semibold">
                <th className="py-3 px-4">Nhân Viên</th>
                <th className="py-3 px-4">Trạng Thái Capacity</th>
                <th className="py-3 px-4">
                  {activeTab === 'available' ? 'Phần Trăm Khả Dụng (Available)' : 'Tổng Phân Bổ (Utilization)'}
                </th>
                <th className="py-3 px-4">Đánh Giá Tải</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-800 text-sm">
              {filteredData.length > 0 ? (
                filteredData.map((item) => {
                  const empObj = employees.find(e => e.employeeId === item.employeeId);
                  
                  // Label allocation rating
                  let rateBadge = <Badge variant="success">An toàn</Badge>;
                  if (item.totalAllocation > 90) {
                    rateBadge = <Badge variant="danger">Quá tải</Badge>;
                  } else if (item.totalAllocation >= 80) {
                    rateBadge = <Badge variant="warning">Mức Cảnh báo</Badge>;
                  } else if (item.totalAllocation === 0) {
                    rateBadge = <Badge variant="neutral">Rảnh rỗi</Badge>;
                  }

                  return (
                    <tr key={item.employeeId} className="hover:bg-slate-50/55 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        <div>
                          <p>{item.employeeName}</p>
                          <p className="text-xs text-slate-400 font-normal">
                            {empObj ? `${empObj.employeeCode} • ${empObj.role} (${empObj.department})` : ''}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 w-1/3">
                        <ProgressBar percent={item.totalAllocation} showText={true} />
                      </td>
                      <td className="py-4 px-4 font-bold text-center sm:text-left">
                        {activeTab === 'available' ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {item.available}% khả dụng
                          </span>
                        ) : (
                          <span className={item.totalAllocation > 90 ? 'text-red-500 font-extrabold' : ''}>
                            {item.totalAllocation}%
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">{rateBadge}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    Không tìm thấy dữ liệu phù hợp với tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
