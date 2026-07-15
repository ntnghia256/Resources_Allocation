import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card, Button, Badge, Alert } from '../components/UI';
import { BrainCircuit, Search, HelpCircle, AlertTriangle, Sparkles, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const textareaClass = [
  'w-full px-4 py-3 text-sm rounded-xl border resize-none',
  'border-slate-200 dark:border-slate-800',
  'bg-slate-50/50 dark:bg-slate-900/60',
  'text-slate-800 dark:text-slate-100 placeholder-slate-400',
  'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
  'dark:[color-scheme:dark]',
].join(' ');

export const AIConsole: React.FC = () => {
  const { aiRecommendation, aiRiskDetection, loading } = useAppStore();
  const navigate = useNavigate();

  // Recommendations state
  const [recPrompt, setRecPrompt] = useState('Tìm Developer còn tối thiểu 50% available');
  const [recs, setRecs] = useState<{ employee: string; available: number }[] | null>(null);

  // Risk Detection state
  const [riskPrompt, setRiskPrompt] = useState('Sprint tới dự án NCG cần thêm 2 Developer');
  const [risks, setRisks] = useState<string[] | null>(null);

  const samplePromptsRec = [
    'Tìm Java Developer còn tối thiểu 50% available',
    'Tìm nhân sự Frontend còn trống lịch làm việc',
    'Tìm DevOps Engineer trống ít nhất 30% capacity',
  ];

  const samplePromptsRisk = [
    'Dự án GRID cần bổ sung gấp 3 nhân sự fulltime',
    'Sprint tới cần tuyển thêm 1 Backend Developer',
    'Thêm 2 PM vào quản trị dự án mới',
  ];

  // Submit Recommendation Query
  const handleGetRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recPrompt.trim()) return;
    setRecs([]);
    const res = await aiRecommendation(recPrompt);
    setRecs(res.recommendedResources);
  };

  // Submit Risk Detection Query
  const handleGetRisks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskPrompt.trim()) return;
    setRisks(null);
    const res = await aiRiskDetection(riskPrompt);
    setRisks(res.risks);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Title */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-xl text-white shadow-md shadow-blue-200 dark:shadow-none animate-pulse">
          <BrainCircuit className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Trợ Lý AI Thông Minh
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Sử dụng trí tuệ nhân tạo để đề xuất nguồn lực và phát hiện rủi ro phân bổ công việc.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Module 1: AI Recommendation */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
                Đề Xuất Nhân Sự Thông Minh
              </h3>
              <Badge variant="primary">AI Recommender</Badge>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
              Nhập yêu cầu bằng tiếng Việt tự nhiên để tìm kiếm nhân sự có chuyên môn và năng lực rảnh rỗi phù hợp.
            </p>

            <form onSubmit={handleGetRecommendations} className="space-y-3">
              <textarea
                rows={2}
                value={recPrompt}
                onChange={(e) => setRecPrompt(e.target.value)}
                placeholder="Ví dụ: Tìm Java Developer còn tối thiểu 50% available..."
                className={textareaClass}
              />

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5 max-w-[70%]">
                  {samplePromptsRec.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRecPrompt(p)}
                      className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded-md text-slate-500 dark:text-slate-400 transition-colors whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
                      title={p}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={loading}
                  className="shadow-sm"
                >
                  <Search className="h-3.5 w-3.5 mr-1" /> Tìm kiếm
                </Button>
              </div>
            </form>
          </Card>

          {/* Results Output */}
          {recs && (
            <Card className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Kết Quả Đề Xuất ({recs.length})
              </h4>
              
              {recs.length > 0 ? (
                <div className="space-y-3">
                  {recs.map((r, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/55 dark:bg-slate-900/20 hover:scale-[1.01] transition-transform"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{r.employee}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          Khả năng nhận việc: {r.available}% capacity rảnh
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate('/allocations')}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1 border-blue-500/20 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Phân bổ</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center bg-slate-50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  Không tìm thấy nhân sự phù hợp với điều kiện đưa ra.
                </p>
              )}
            </Card>
          )}
        </div>

        {/* Module 2: AI Risk Detection */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-indigo-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                <AlertTriangle className="h-5 w-5 text-indigo-500 mr-2" />
                Phát Hiện Rủi Ro Kế Hoạch
              </h3>
              <Badge variant="neutral">AI Risk Guard</Badge>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
              Mô tả kế hoạch bổ sung nhân sự tiếp theo để AI phân tích và cảnh báo rủi ro về mặt công suất dự án.
            </p>

            <form onSubmit={handleGetRisks} className="space-y-3">
              <textarea
                rows={2}
                value={riskPrompt}
                onChange={(e) => setRiskPrompt(e.target.value)}
                placeholder="Ví dụ: Sprint tới cần thêm 2 Java Developer..."
                className={textareaClass}
              />

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5 max-w-[70%]">
                  {samplePromptsRisk.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRiskPrompt(p)}
                      className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded-md text-slate-500 dark:text-slate-400 transition-colors whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
                      title={p}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={loading}
                  className="shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-indigo-200 dark:shadow-none"
                >
                  Phân tích
                </Button>
              </div>
            </form>
          </Card>

          {/* Risk Output */}
          {risks && (
            <Card className="space-y-3">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Kết Quả Đánh Giá Rủi Ro ({risks.length})
              </h4>

              {risks.map((risk, idx) => {
                const isHighRisk = risk.toLowerCase().includes('quá tải')
                  || risk.includes('90%')
                  || risk.toLowerCase().includes('chỉ còn');
                return (
                  <Alert key={idx} type={isHighRisk ? 'error' : 'warning'}>
                    {risk}
                  </Alert>
                );
              })}
            </Card>
          )}
        </div>
      </div>

      {/* Helpful Hint Card */}
      <Card className="flex items-center space-x-3.5 bg-slate-100/45 dark:bg-slate-900/30">
        <HelpCircle className="h-6 w-6 text-blue-500 flex-shrink-0" />
        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <strong>Mẹo sử dụng:</strong> AI hỗ trợ quét năng lực khả dụng được đồng bộ theo thời gian thực từ dữ liệu phân bổ trên hệ thống.
          Các từ khóa chính xác liên quan đến chức vụ chuyên môn (ví dụ: <em>Java</em>, <em>Frontend</em>, <em>DevOps</em>) hoặc phần trăm khả năng (ví dụ: <em>50%</em>) sẽ được AI tự động phân tích và trích xuất.
        </div>
      </Card>

    </div>
  );
};
