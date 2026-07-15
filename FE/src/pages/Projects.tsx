import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card, Button, Input, Select, Badge, Modal, ProgressBar } from '../components/UI';
import { Plus, Edit2, Search, Eye, Calendar, UserCheck, FolderGit2 } from 'lucide-react';
import type { Project, ProjectStatus } from '../types';

export const Projects: React.FC = () => {
  const { 
    projects, 
    employees,
    addProject, 
    updateProject, 
    getProjectAllocations 
  } = useAppStore();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal Control
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Form State
  const [formValues, setFormValues] = useState({
    projectCode: '',
    projectName: '',
    customer: '',
    status: 'PLANNING' as ProjectStatus
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const statuses: ProjectStatus[] = ['PLANNING', 'ACTIVE', 'COMPLETED'];

  // Handle Form Open
  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormValues({
      projectCode: '',
      projectName: '',
      customer: '',
      status: 'PLANNING'
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const handleOpenEdit = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(proj);
    setFormValues({
      projectCode: proj.projectCode,
      projectName: proj.projectName,
      customer: proj.customer,
      status: proj.status
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const handleOpenDetail = (proj: Project) => {
    setSelectedProject(proj);
    setDetailModalOpen(true);
  };

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formValues.projectCode.trim()) {
      errors.projectCode = 'Mã dự án không được để trống.';
    } else if (!editingProject && projects.some(p => p.projectCode.toLowerCase() === formValues.projectCode.trim().toLowerCase())) {
      errors.projectCode = 'Mã dự án này đã tồn tại.';
    }

    if (!formValues.projectName.trim()) {
      errors.projectName = 'Tên dự án không được để trống.';
    }

    if (!formValues.customer.trim()) {
      errors.customer = 'Tên khách hàng không được để trống.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data: Project = {
      projectCode: formValues.projectCode.trim(),
      projectName: formValues.projectName.trim(),
      customer: formValues.customer.trim(),
      status: formValues.status
    };

    let success = false;
    if (editingProject) {
      success = await updateProject(editingProject.projectId!, data);
    } else {
      success = await addProject(data);
    }

    if (success) {
      setFormModalOpen(false);
    }
  };

  // Filter Logic
  const filteredProjects = projects.filter(proj => {
    const matchesSearch = proj.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          proj.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          proj.customer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || proj.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get project status badge helper
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'PLANNING':
        return <Badge variant="warning">Chuẩn Bị (Planning)</Badge>;
      case 'ACTIVE':
        return <Badge variant="primary">Đang Chạy (Active)</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">Hoàn Thành (Completed)</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Quản Lý Dự Án
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi danh sách các dự án outsource, thông tin khách hàng và nhân lực tham gia.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Tạo Dự Án Mới</span>
        </Button>
      </div>

      {/* Filter and Search controls */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo tên dự án, mã dự án hoặc khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:[color-scheme:dark]"
          />
        </div>
        
        {/* Status Filter */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="text-sm text-slate-400 font-semibold whitespace-nowrap">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">Tất cả Trạng thái</option>
            <option value="PLANNING">PLANNING</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>
      </Card>

      {/* Projects Grid/Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider text-xs font-semibold bg-slate-50/50 dark:bg-slate-900/30">
                <th className="py-3.5 px-6">Mã dự án</th>
                <th className="py-3.5 px-6">Tên Dự Án</th>
                <th className="py-3.5 px-6">Khách hàng</th>
                <th className="py-3.5 px-6">Trạng thái</th>
                <th className="py-3.5 px-6">Nhân sự hiện có</th>
                <th className="py-3.5 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-800 text-sm">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((proj) => {
                  const projAllocs = getProjectAllocations(proj.projectId!);
                  const totalPercent = projAllocs.reduce((sum, a) => sum + a.allocationPercent, 0);

                  return (
                    <tr 
                      key={proj.projectId}
                      onClick={() => handleOpenDetail(proj)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors cursor-pointer"
                    >
                      <td className="py-4.5 px-6 font-bold text-indigo-600 dark:text-indigo-400">
                        {proj.projectCode}
                      </td>
                      <td className="py-4.5 px-6 font-semibold text-slate-900 dark:text-slate-100">
                        {proj.projectName}
                      </td>
                      <td className="py-4.5 px-6 text-slate-650 dark:text-slate-350 font-medium">
                        {proj.customer}
                      </td>
                      <td className="py-4.5 px-6">
                        {getStatusBadge(proj.status)}
                      </td>
                      <td className="py-4.5 px-6 font-semibold text-slate-600 dark:text-slate-400">
                        {projAllocs.length} người <span className="text-xs font-normal text-slate-400">({totalPercent}%)</span>
                      </td>
                      <td className="py-4.5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleOpenDetail(proj)}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                            title="Xem chi tiết dự án"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={(e) => handleOpenEdit(proj, e)}
                            className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                            title="Sửa thông tin"
                          >
                            <Edit2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    Không tìm thấy dự án nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: ADD/EDIT PROJECT */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingProject ? `Sửa dự án: ${editingProject.projectName}` : 'Tạo Dự Án Mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Mã dự án (Project Code)"
            placeholder="Ví dụ: PRJ001"
            value={formValues.projectCode}
            onChange={(e) => setFormValues({ ...formValues, projectCode: e.target.value })}
            error={formErrors.projectCode}
            disabled={!!editingProject}
          />

          <Input
            label="Tên dự án"
            placeholder="Ví dụ: NCG Core Development"
            value={formValues.projectName}
            onChange={(e) => setFormValues({ ...formValues, projectName: e.target.value })}
            error={formErrors.projectName}
          />

          <Input
            label="Tên Khách Hàng (Customer)"
            placeholder="Ví dụ: NTT Data, FPT Software, v.v."
            value={formValues.customer}
            onChange={(e) => setFormValues({ ...formValues, customer: e.target.value })}
            error={formErrors.customer}
          />

          <Select
            label="Trạng Thái Hoạt Động (Status)"
            options={statuses.map(st => ({ value: st, label: st }))}
            value={formValues.status}
            onChange={(e) => setFormValues({ ...formValues, status: e.target.value as ProjectStatus })}
          />

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setFormModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary">
              {editingProject ? 'Lưu thay đổi' : 'Tạo dự án'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: PROJECT ALLOCATIONS DETAIL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Chi Tiết Dự Án & Đội Ngũ Nhân Sự"
      >
        {selectedProject && (() => {
          const projAllocs = getProjectAllocations(selectedProject.projectId!);
          const totalPercentAllocated = projAllocs.reduce((sum, a) => sum + a.allocationPercent, 0);

          return (
            <div className="space-y-6">
              
              {/* Profile Card */}
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80">
                <div className="p-3 bg-indigo-600 rounded-xl text-white">
                  <FolderGit2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedProject.projectName} ({selectedProject.projectCode})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Khách hàng: <span className="font-semibold">{selectedProject.customer}</span>
                  </p>
                  <div className="mt-1">
                    {getStatusBadge(selectedProject.status)}
                  </div>
                </div>
              </div>

              {/* Resource capacity allocated summary */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Tổng năng lực phân bổ vào dự án:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{totalPercentAllocated}%</span>
                </div>
                <ProgressBar percent={totalPercentAllocated} showText={false} />
              </div>

              {/* Members Allocated */}
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-slate-850 dark:text-slate-200">
                  Thành viên đội dự án ({projAllocs.length})
                </h5>
                
                {projAllocs.length > 0 ? (
                  <div className="space-y-3">
                    {projAllocs.map((alloc) => {
                      const emp = employees.find(e => e.employeeId === alloc.employeeId);
                      
                      return (
                        <div
                          key={alloc.allocationId}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                        >
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 dark:text-white flex items-center">
                              <UserCheck className="h-4 w-4 mr-1.5 text-blue-500" />
                              {emp ? emp.fullName : `Mã nhân sự: ${alloc.employeeId}`}
                              <span className="text-xs font-normal text-slate-400 ml-2">({emp ? emp.employeeCode : ''})</span>
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Vai trò trong dự án: <span className="font-semibold text-slate-600 dark:text-slate-300">{alloc.roleInProject}</span>
                            </p>
                             <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center">
                               <Calendar className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 mr-1.5" />
                               {alloc.startDate} → {alloc.endDate}
                             </p>
                          </div>
                          <div className="text-right flex items-center justify-between sm:block">
                            <span className="text-xs text-slate-400 sm:block">Allocation:</span>
                            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 sm:block sm:mt-0.5">
                              {alloc.allocationPercent}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    Chưa có nhân sự nào được phân bổ vào dự án này.
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
