
import React, { useRef, useState } from 'react';
import { 
  FileText, Upload, Trash2, ShieldCheck, 
  Plus, Users, DollarSign, Terminal, Scale, Briefcase,
  ChevronRight, X, FilePlus, Sprout, Share2, Check
} from 'lucide-react';
import { Agent, AppStatus, DepartmentType } from '../types';

interface SidebarProps {
  agents: Agent[];
  activeAgentId: string;
  status: AppStatus;
  isOpen: boolean;
  onClose: () => void;
  onSelectAgent: (id: string) => void;
  onAddAgent: (name: string, type: DepartmentType) => void;
  onDeleteAgent: (id: string) => void;
  onFilesSelect: (files: FileList) => void;
  onRemoveFile: (agentId: string, fileId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  agents, activeAgentId, status, isOpen, onClose,
  onSelectAgent, onAddAgent, onDeleteAgent, onFilesSelect, onRemoveFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentType, setNewAgentType] = useState<DepartmentType>('GENERAL');
  const [shared, setShared] = useState(false);

  const activeAgent = agents.find(a => a.id === activeAgentId);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const getIcon = (type: DepartmentType) => {
    switch (type) {
      case 'HR': return <Users className="w-4 h-4" />;
      case 'FINANCE': return <DollarSign className="w-4 h-4" />;
      case 'IT': return <Terminal className="w-4 h-4" />;
      case 'LEGAL': return <Scale className="w-4 h-4" />;
      default: return <Briefcase className="w-4 h-4" />;
    }
  };

  const getBgColor = (type: DepartmentType) => {
    switch (type) {
      case 'HR': return 'bg-pink-50 text-pink-600';
      case 'FINANCE': return 'bg-orange-50 text-orange-600';
      case 'IT': return 'bg-blue-50 text-blue-600';
      case 'LEGAL': return 'bg-emerald-50 text-[#008d44]';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAgentName.trim()) {
      onAddAgent(newAgentName.trim(), newAgentType);
      setNewAgentName('');
      setShowAddForm(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-emerald-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`fixed lg:static inset-y-0 left-0 w-80 bg-white flex flex-col p-6 select-none border-r border-emerald-100 z-50 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#008d44] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Sprout className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 leading-tight">Vinaseed</h1>
              <p className="text-[10px] font-bold text-[#008d44] uppercase tracking-widest">Legal Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2">
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phòng Ban Nghiệp Vụ</h2>
              <button 
                onClick={() => setShowAddForm(true)}
                className="p-1 hover:bg-emerald-50 text-[#008d44] rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleCreateAgent} className="mb-4 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 shadow-sm animate-in fade-in zoom-in duration-200">
                <input 
                  autoFocus
                  className="w-full text-xs p-2 border border-white rounded-lg mb-2 focus:ring-1 focus:ring-[#008d44] outline-none shadow-sm"
                  placeholder="Tên phòng ban..."
                  value={newAgentName}
                  onChange={e => setNewAgentName(e.target.value)}
                />
                <select 
                  className="w-full text-[10px] p-2 bg-white rounded-lg mb-3 outline-none border border-emerald-50"
                  value={newAgentType}
                  onChange={e => setNewAgentType(e.target.value as DepartmentType)}
                >
                  <option value="GENERAL">Tổng hợp</option>
                  <option value="HR">Nhân sự</option>
                  <option value="FINANCE">Tài chính</option>
                  <option value="IT">Kỹ thuật</option>
                  <option value="LEGAL">Pháp chế</option>
                </select>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-[#008d44] text-white text-[10px] py-1.5 rounded-lg font-bold">Tạo</button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-3 text-[10px] text-slate-400 font-bold">Hủy</button>
                </div>
              </form>
            )}

            <div className="space-y-1">
              {agents.map(agent => (
                <div 
                  key={agent.id}
                  onClick={() => { onSelectAgent(agent.id); if(window.innerWidth < 1024) onClose(); }}
                  className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    activeAgentId === agent.id 
                      ? 'bg-emerald-50 border border-emerald-100' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activeAgentId === agent.id ? 'bg-[#008d44] text-white' : getBgColor(agent.type)
                  }`}>
                    {getIcon(agent.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${activeAgentId === agent.id ? 'text-[#008d44]' : 'text-slate-600'}`}>
                      {agent.name}
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase font-medium">
                      {agent.documents.length} văn bản
                    </p>
                  </div>
                  {activeAgentId === agent.id && <ChevronRight className="w-3 h-3 text-[#008d44]" />}
                </div>
              ))}
            </div>
          </section>

          {activeAgent && (
            <section className="animate-in slide-in-from-left-2 duration-300">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tài liệu Nạp vào</h2>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 hover:bg-emerald-50 text-[#008d44] rounded-md transition-colors"
                >
                  <FilePlus className="w-4 h-4" />
                </button>
              </div>

              {activeAgent.documents.length > 0 ? (
                <div className="space-y-2">
                  {activeAgent.documents.map(doc => (
                    <div key={doc.id} className="bg-white rounded-xl p-3 border border-emerald-50 group relative">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[#008d44] flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-slate-700 truncate">{doc.title}</p>
                        </div>
                        <button 
                          onClick={() => onRemoveFile(activeAgentId, doc.id)}
                          className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 border-2 border-dashed border-emerald-100 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#008d44] hover:bg-emerald-50/50 transition-all"
                >
                  <Upload className="w-5 h-5 text-emerald-300" />
                  <span className="text-[10px] font-bold text-emerald-700 px-4 text-center leading-relaxed">Tải quy chế</span>
                </button>
              )}
              
              <input type="file" multiple ref={fileInputRef} onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) onFilesSelect(files);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }} accept=".txt,.md,.pdf,.docx" className="hidden" 
              />
            </section>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-emerald-100 space-y-3">
          <button 
            onClick={handleShare}
            className="w-full py-3 bg-white border border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
          >
            {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {shared ? 'ĐÃ SAO CHÉP LINK' : 'CHIA SẺ ỨNG DỤNG'}
          </button>
          
          <div className="flex items-center justify-between bg-[#008d44] p-3 rounded-xl shadow-lg shadow-emerald-200/50">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Vinaseed Active</span>
             </div>
             <p className="text-[9px] text-emerald-100 font-mono">v1.5.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
