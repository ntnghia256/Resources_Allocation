import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card, Button, Input, Select, Badge, Modal, Alert } from '../components/UI';
import { Edit2, Trash2, Search, Calendar, UserPlus } from 'lucide-react';
import type { Allocation } from '../types';

export const Allocations: React.FC = () => {
  const {
    allocations,
    employees,
    projects,
    addAllocation,
    updateAllocation,
    deleteAllocation,
    getEmployeeWorkload,
    error,
    setError,
    successMessage,
    setSuccessMessage
  } = useAppStore();

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');

  // Modal controls
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAlloc, setEditingAlloc] = useState<Allocation | null>(null);

  // Form State
  const [formValues, setFormValues] = useState({
    employeeId: '',
    projectId: '',
    allocationPercent: 50,
    roleInProject: '',
    startDate: '',
    endDate: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Reset alerts on mount
  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
  }, [setError, setSuccessMessage]);

  // Handle Create Open
  const handleOpenCreate = () => {
    setEditingAlloc(null);
    // Find first employee and project to set default values
    const availableEmployees = employees;
    const activeOrPlanningProjects = projects.filter(p => p.status !== 'COMPLETED');

    setFormValues({
      employeeId: availableEmployees[0] ? String(availableEmployees[0].employeeId) : '',
      projectId: activeOrPlanningProjects[0] ? String(activeOrPlanningProjects[0].projectId) : '',
      allocationPercent: 50,
      roleInProject: 'Developer',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0] // 1 year default
    });
    setFormErrors({});
    setError(null);
    setModalOpen(true);
  };

  // Handle Edit Open
  const handleOpenEdit = (alloc: Allocation) => {
    setEditingAlloc(alloc);
    setFormValues({
      employeeId: String(alloc.employeeId),
      projectId: String(alloc.projectId),
      allocationPercent: alloc.allocationPercent,
      roleInProject: alloc.roleInProject,
      startDate: alloc.startDate,
      endDate: alloc.endDate
    });
    setFormErrors({});
    setError(null);
    setModalOpen(true);
  };

  // Validate form locally before calling store
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formValues.employeeId) {
      errors.employeeId = 'Vui lòng chọn nhân viên.';
    }
    if (!formValues.projectId) {
      errors.projectId = 'Vui lòng chọn dự án.';
    }
    if (!formValues.roleInProject.trim()) {
      errors.roleInProject = 'Vui lòng nhập vai trò của nhân viên trong dự án.';
    }
    if (formValues.allocationPercent <= 0 || formValues.allocationPercent > 100) {
      errors.allocationPercent = 'Tỷ lệ phân bổ phải từ 1% đến 100%.';
    }
    if (!formValues.startDate) {
      errors.startDate = 'Vui lòng nhập ngày bắt đầu.';
    }
    if (!formValues.endDate) {
      errors.endDate = 'Vui lòng nhập ngày kết thúc.';
    } else if (formValues.startDate && new Date(formValues.endDate) < new Date(formValues.startDate)) {
      errors.endDate = 'Ngày kết thúc không được sớm hơn ngày bắt đầu.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError(null);
    setSuccessMessage(null);

    const data: Allocation = {
      employeeId: Number(formValues.employeeId),
      projectId: Number(formValues.projectId),
      allocationPercent: Number(formValues.allocationPercent),
      roleInProject: formValues.roleInProject.trim(),
      startDate: formValues.startDate,
      endDate: formValues.endDate
    };

    let success = false;
    if (editingAlloc) {
      success = await updateAllocation(editingAlloc.allocationId!, data);
    } else {
      success = await addAllocation(data);
    }

    if (success) {
      setModalOpen(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy phân bổ nhân sự này?')) {
      setError(null);
      setSuccessMessage(null);
      await deleteAllocation(id);
    }
  };

  // Options lists
  const employeeOptions = employees.map(emp => {
    const wl = getEmployeeWorkload(emp.employeeId!);
    // Deduct current allocation percentage if editing
    const currentAllocForEmp = editingAlloc && editingAlloc.employeeId === emp.employeeId ? editingAlloc.allocationPercent : 0;
    const adjustedAvailable = Math.min(100, wl.available + currentAllocForEmp);
    
    return {
      value: String(emp.employeeId),
      label: `${emp.fullName} (${emp.employeeCode}) - Hiện rảnh: ${adjustedAvailable}%`
    };
  });

  // Projects dropdown (filter out COMPLETED unless we are editing an allocation that already points to a COMPLETED project)
  const projectOptions = projects
    .filter(p => p.status !== 'COMPLETED' || (editingAlloc && editingAlloc.projectId === p.projectId))
    .map(p => ({
      value: String(p.projectId),
      label: `${p.projectName} (${p.projectCode}) - Trạng thái: ${p.status}`
    }));

  // Filtering allocations by search term (search by employee name or project name)
  const filteredAllocations = allocations.map(alloc => {
    const emp = employees.find(e => e.employeeId === alloc.employeeId);
    const proj = projects.find(p => p.projectId === alloc.projectId);
    
    return {
      ...alloc,
      employeeName: emp ? emp.fullName : 'Nhân viên không tồn tại',
      employeeCode: emp ? emp.employeeCode : 'N/A',
      projectName: proj ? proj.projectName : 'Dự án không tồn tại',
      projectCode: proj ? proj.projectCode : 'N/A'
    };
  }).filter(alloc => {
    const searchString = searchTerm.toLowerCase();
    return alloc.employeeName.toLowerCase().includes(searchString) ||
           alloc.employeeCode.toLowerCase().includes(searchString) ||
           alloc.projectName.toLowerCase().includes(searchString) ||
           alloc.projectCode.toLowerCase().includes(searchString);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Quản Lý Phân Bổ Nhân Sự
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Phân phối năng lực làm việc của nhân sự vào các dự án đang triển khai.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center space-x-2">
          <UserPlus className="h-4.5 w-4.5" />
          <span>Phân Bổ Nhân Sự</span>
        </Button>
      </div>

      {/* Global Alerts inside components */}
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert type="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm phân bổ theo tên nhân viên, mã dự án..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:[color-scheme:dark]"
          />
        </div>
      </Card>

      {/* Allocations Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider text-xs font-semibold bg-slate-50/50 dark:bg-slate-900/30">
                <th className="py-3.5 px-6">Nhân Sự</th>
                <th className="py-3.5 px-6">Dự Án</th>
                <th className="py-3.5 px-6">Vai trò trong Dự án</th>
                <th className="py-3.5 px-6">Tỷ Lệ Phân Bổ</th>
                <th className="py-3.5 px-6">Thời gian</th>
                <th className="py-3.5 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-800 text-sm">
              {filteredAllocations.length > 0 ? (
                filteredAllocations.map((alloc) => {
                  return (
                    <tr key={alloc.allocationId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="py-4.5 px-6">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{alloc.employeeName}</p>
                          <p className="text-xs text-slate-400">{alloc.employeeCode}</p>
                        </div>
                      </td>
                      <td className="py-4.5 px-6">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100">{alloc.projectName}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{alloc.projectCode}</p>
                        </div>
                      </td>
                      <td className="py-4.5 px-6">
                        <Badge variant="neutral">{alloc.roleInProject}</Badge>
                      </td>
                      <td className="py-4.5 px-6 font-extrabold text-blue-600 dark:text-blue-400">
                        {alloc.allocationPercent}%
                      </td>
                      <td className="py-4.5 px-6">
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 mr-1.5" />
                          <span>{alloc.startDate} → {alloc.endDate}</span>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleOpenEdit(alloc)}
                            className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                            title="Sửa phân bổ"
                          >
                            <Edit2 className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(alloc.allocationId!)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                            title="Xóa phân bổ"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    Không tìm thấy phân bổ nguồn lực nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: ADD/EDIT ALLOCATION */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAlloc ? 'Cập Nhật Phân Bổ Nhân Sự' : 'Phân Bổ Nhân Sự Vào Dự Án'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <Select
            label="Chọn Nhân Viên (Employee)"
            options={employeeOptions}
            value={formValues.employeeId}
            onChange={(e) => setFormValues({ ...formValues, employeeId: e.target.value })}
            error={formErrors.employeeId}
            disabled={!!editingAlloc} // Don't let users edit employee in allocation, create a new one instead
          />

          <Select
            label="Chọn Dự Án (Project)"
            options={projectOptions}
            value={formValues.projectId}
            onChange={(e) => setFormValues({ ...formValues, projectId: e.target.value })}
            error={formErrors.projectId}
            disabled={!!editingAlloc} // Don't edit project in allocation
          />

          <Input
            label="Vai trò trong Dự án (Role in Project)"
            placeholder="Ví dụ: Backend Developer, QA Lead, PM..."
            value={formValues.roleInProject}
            onChange={(e) => setFormValues({ ...formValues, roleInProject: e.target.value })}
            error={formErrors.roleInProject}
          />

          <Input
            label="Tỷ Lệ Phân Bổ (% Allocation)"
            placeholder="Từ 1 đến 100"
            type="number"
            min={1}
            max={100}
            value={formValues.allocationPercent}
            onChange={(e) => setFormValues({ ...formValues, allocationPercent: Number(e.target.value) })}
            error={formErrors.allocationPercent}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ngày bắt đầu (Start Date)"
              type="date"
              value={formValues.startDate}
              onChange={(e) => setFormValues({ ...formValues, startDate: e.target.value })}
              error={formErrors.startDate}
            />

            <Input
              label="Ngày kết thúc (End Date)"
              type="date"
              value={formValues.endDate}
              onChange={(e) => setFormValues({ ...formValues, endDate: e.target.value })}
              error={formErrors.endDate}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary">
              {editingAlloc ? 'Lưu cập nhật' : 'Tạo Phân Bổ'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
