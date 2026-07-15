import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card, Button, Input, Select, Badge, Modal, ProgressBar } from '../components/UI';
import { Plus, Edit2, Search, Eye, Mail, Building, Calendar, Users } from 'lucide-react';
import type { Employee } from '../types';

export const Employees: React.FC = () => {
  const { 
    employees, 
    projects,
    addEmployee, 
    updateEmployee, 
    getEmployeeWorkload, 
    getEmployeeAllocations,
    usingMockData
  } = useAppStore();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Modal control
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Form State
  const [formValues, setFormValues] = useState({
    employeeCode: '',
    fullName: '',
    email: '',
    role: '',
    department: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Departments List
  const departments = ['FSOFT-Q1', 'FSOFT-Q2', 'FSOFT-Q3'];

  // Handle Form Open
  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setFormValues({
      employeeCode: '',
      fullName: '',
      email: '',
      role: '',
      department: departments[0]
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop row click triggering details modal
    setEditingEmployee(emp);
    setFormValues({
      employeeCode: emp.employeeCode,
      fullName: emp.fullName,
      email: emp.email,
      role: emp.role,
      department: emp.department
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const handleOpenDetail = (emp: Employee) => {
    setSelectedEmployee(emp);
    setDetailModalOpen(true);
  };

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formValues.employeeCode.trim()) {
      errors.employeeCode = 'Mã nhân viên không được để trống.';
    } else if (!editingEmployee && employees.some(e => e.employeeCode.toLowerCase() === formValues.employeeCode.trim().toLowerCase())) {
      errors.employeeCode = 'Mã nhân viên đã tồn tại trong hệ thống.';
    }
    
    if (!formValues.fullName.trim()) {
      errors.fullName = 'Họ và tên không được để trống.';
    }
    
    if (!formValues.email.trim()) {
      errors.email = 'Email không được để trống.';
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      errors.email = 'Email không đúng định dạng.';
    }
    
    if (!formValues.role.trim()) {
      errors.role = 'Vai trò/Chức danh không được để trống.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data: Employee = {
      employeeCode: formValues.employeeCode.trim(),
      fullName: formValues.fullName.trim(),
      email: formValues.email.trim(),
      role: formValues.role.trim(),
      department: formValues.department
    };

    let success = false;
    if (editingEmployee) {
      success = await updateEmployee(editingEmployee.employeeId!, data);
    } else {
      success = await addEmployee(data);
    }

    if (success) {
      setFormModalOpen(false);
    }
  };

  // Filter logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Quản Lý Nhân Sự
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Xem danh sách hồ sơ nhân sự, thông tin liên hệ và workload chi tiết.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Thêm Nhân Viên</span>
        </Button>
      </div>

      {/* Filter and Search controls */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã hoặc chức vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:[color-scheme:dark]"
          />
        </div>
        
        {/* Department Filter */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="text-sm text-slate-400 font-semibold whitespace-nowrap">Bộ phận:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">Tất cả Bộ phận</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Employees Grid/List */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider text-xs font-semibold bg-slate-50/50 dark:bg-slate-900/30">
                <th className="py-3.5 px-6">Mã nhân viên</th>
                <th className="py-3.5 px-6">Họ và Tên</th>
                <th className="py-3.5 px-6">Chức danh / Vai trò</th>
                <th className="py-3.5 px-6">Bộ phận</th>
                <th className="py-3.5 px-6">Workload</th>
                <th className="py-3.5 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-800 text-sm">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => {
                  const wl = getEmployeeWorkload(emp.employeeId!);
                  return (
                    <tr 
                      key={emp.employeeId} 
                      onClick={() => handleOpenDetail(emp)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors cursor-pointer"
                    >
                      <td className="py-4.5 px-6 font-bold text-blue-600 dark:text-blue-400">
                        {emp.employeeCode}
                      </td>
                      <td className="py-4.5 px-6 font-semibold text-slate-900 dark:text-slate-100">
                        {emp.fullName}
                      </td>
                      <td className="py-4.5 px-6 text-slate-600 dark:text-slate-300">
                        {emp.role}
                      </td>
                      <td className="py-4.5 px-6">
                        <Badge variant="neutral">{emp.department}</Badge>
                      </td>
                      <td className="py-4.5 px-6 w-1/5" onClick={(e) => e.stopPropagation()}>
                        <ProgressBar percent={wl.totalAllocation} showText={true} />
                      </td>
                      <td className="py-4.5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleOpenDetail(emp)}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                            title="Xem chi tiết workload"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </button>
                          {usingMockData && (
                            <button
                              onClick={(e) => handleOpenEdit(emp, e)}
                              className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                              title="Sửa thông tin (Sandbox)"
                            >
                              <Edit2 className="h-4.5 w-4.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    Không tìm thấy nhân viên nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: ADD/EDIT EMPLOYEE */}
      <Modal 
        isOpen={formModalOpen} 
        onClose={() => setFormModalOpen(false)} 
        title={editingEmployee ? `Cập nhật Nhân viên: ${editingEmployee.fullName}` : 'Thêm Nhân Viên Mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Mã nhân viên (Employee Code)"
            placeholder="Ví dụ: EMP001"
            value={formValues.employeeCode}
            onChange={(e) => setFormValues({ ...formValues, employeeCode: e.target.value })}
            error={formErrors.employeeCode}
            disabled={!!editingEmployee} // Do not edit code after creation
          />
          
          <Input
            label="Họ và Tên"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={formValues.fullName}
            onChange={(e) => setFormValues({ ...formValues, fullName: e.target.value })}
            error={formErrors.fullName}
          />
          
          <Input
            label="Địa chỉ Email"
            placeholder="tuanha@company.com"
            value={formValues.email}
            onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
            error={formErrors.email}
            type="email"
          />

          <Input
            label="Vai trò / Chức danh chuyên môn"
            placeholder="Ví dụ: Senior Backend Developer"
            value={formValues.role}
            onChange={(e) => setFormValues({ ...formValues, role: e.target.value })}
            error={formErrors.role}
          />

          <Select
            label="Bộ phận / Phòng ban (Department)"
            options={departments.map(d => ({ value: d, label: d }))}
            value={formValues.department}
            onChange={(e) => setFormValues({ ...formValues, department: e.target.value })}
          />

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setFormModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary">
              {editingEmployee ? 'Lưu thay đổi' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: EMPLOYEE WORKLOAD DETAIL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Chi Tiết Hồ Sơ & Phân Bổ"
      >
        {selectedEmployee && (() => {
          const wl = getEmployeeWorkload(selectedEmployee.employeeId!);
          const empAllocs = getEmployeeAllocations(selectedEmployee.employeeId!);

          return (
            <div className="space-y-6">
              
              {/* Profile card summary */}
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80">
                <div className="p-3 bg-blue-600 rounded-xl text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedEmployee.fullName} ({selectedEmployee.employeeCode})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-1" /> {selectedEmployee.email}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                    <Building className="h-3.5 w-3.5 mr-1" /> {selectedEmployee.department} • {selectedEmployee.role}
                  </p>
                </div>
              </div>

              {/* Workload Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Trạng thái Workload</span>
                  <span className={wl.totalAllocation > 90 ? 'text-red-500' : wl.totalAllocation >= 80 ? 'text-amber-500' : 'text-emerald-500'}>
                    {wl.totalAllocation}% Đã Sử Dụng ({wl.available}% Khả Dụng)
                  </span>
                </div>
                <ProgressBar percent={wl.totalAllocation} showText={false} />
              </div>

              {/* Allocations breakdown */}
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-slate-850 dark:text-slate-200">
                  Danh sách Dự án phân bổ ({empAllocs.length})
                </h5>
                {empAllocs.length > 0 ? (
                  <div className="space-y-3">
                    {empAllocs.map((alloc) => {
                      const proj = projects.find(p => p.projectId === alloc.projectId);
                      
                      return (
                        <div 
                          key={alloc.allocationId}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 bg-white dark:bg-slate-900/50"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {proj ? proj.projectName : `Mã dự án: ${alloc.projectId}`}
                            </span>
                            <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                              Tỷ lệ: {alloc.allocationPercent}%
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                            <div>
                              <span className="font-semibold text-slate-400">Vai trò:</span> {alloc.roleInProject}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 mr-1" />
                              <span>{alloc.startDate} → {alloc.endDate}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 py-3 text-center bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    Nhân viên này chưa được phân bổ vào dự án nào.
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button onClick={() => setDetailModalOpen(false)} variant="secondary">
                  Đóng lại
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

    </div>
  );
};
