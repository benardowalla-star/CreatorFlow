import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Loader2, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  BarChart3, 
  MessageSquare, 
  Info,
  ExternalLink,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Video, VideoStatus, STATUS_LABELS, Comment } from '@/src/types';
import { refineVideoDetails } from '@/src/services/geminiService';
import { cn } from '@/src/lib/utils';

interface VideoModalProps {
  video: Partial<Video> | null;
  onClose: () => void;
  onSave: (video: Video) => void;
  onDelete?: (id: string) => void;
}

type Tab = 'details' | 'script' | 'thumbnail' | 'analytics' | 'comments';

export function VideoModal({ video, onClose, onSave, onDelete }: VideoModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [formData, setFormData] = useState<Partial<Video>>({
    title: '',
    description: '',
    status: 'idea',
    scheduledDate: new Date().toISOString(),
    tags: [],
    notes: '',
    script: '',
    thumbnailUrl: '',
    viewsHistory: [],
    comments: [],
    ...video
  });

  const [isRefining, setIsRefining] = useState(false);

  const handleRefine = async () => {
    if (!formData.title) return;
    setIsRefining(true);
    try {
      const refined = await refineVideoDetails(formData.title);
      setFormData(prev => ({
        ...prev,
        description: refined.description || prev.description,
        tags: refined.tags || prev.tags
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.scheduledDate) {
      onSave({
        id: formData.id || Math.random().toString(36).substr(2, 9),
        title: formData.title,
        description: formData.description || '',
        status: formData.status as VideoStatus,
        scheduledDate: formData.scheduledDate,
        tags: formData.tags || [],
        notes: formData.notes || '',
        script: formData.script || '',
        thumbnailUrl: formData.thumbnailUrl || '',
        viewsHistory: formData.viewsHistory || [],
        comments: formData.comments || [],
        youtubeId: formData.youtubeId
      } as Video);
    }
  };

  const addMockComment = () => {
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      author: 'YouTube User',
      text: 'Great video! Looking forward to more.',
      publishedAt: new Date().toISOString(),
    };
    setFormData(prev => ({
      ...prev,
      comments: [newComment, ...(prev.comments || [])]
    }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold text-slate-900 truncate max-w-[400px]">
                {formData.title || (formData.id ? 'Edit Video' : 'Plan New Video')}
              </h3>
              <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", 
                formData.status === 'published' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'
              )}>
                {STATUS_LABELS[formData.status as VideoStatus]}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 px-6 bg-slate-50/50">
            <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')} icon={<Info className="w-4 h-4" />} label="Details" />
            <TabButton active={activeTab === 'script'} onClick={() => setActiveTab('script')} icon={<FileText className="w-4 h-4" />} label="Script" />
            <TabButton active={activeTab === 'thumbnail'} onClick={() => setActiveTab('thumbnail')} icon={<ImageIcon className="w-4 h-4" />} label="Thumbnail" />
            <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 className="w-4 h-4" />} label="Analytics" />
            <TabButton active={activeTab === 'comments'} onClick={() => setActiveTab('comments')} icon={<MessageSquare className="w-4 h-4" />} label="Comments" />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'details' && (
              <div className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Video Title</label>
                  <div className="flex gap-2">
                    <input 
                      autoFocus
                      required
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter a catchy title..."
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleRefine}
                      disabled={isRefining || !formData.title}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 transition-all"
                    >
                      {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      AI Refine
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Status</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as VideoStatus })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Schedule Date</label>
                    <input 
                      required
                      type="date"
                      value={formData.scheduledDate?.split('T')[0]}
                      onChange={e => setFormData({ ...formData, scheduledDate: new Date(e.target.value).toISOString() })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Description</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What is this video about?"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Tags</label>
                  <input 
                    type="text"
                    value={formData.tags?.join(', ')}
                    onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                    placeholder="vlog, tutorial, tech..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'script' && (
              <div className="h-full flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800">Video Script</h4>
                  <span className="text-xs text-slate-400">Auto-saves locally</span>
                </div>
                <textarea 
                  value={formData.script}
                  onChange={e => setFormData({ ...formData, script: e.target.value })}
                  placeholder="Start writing your script here... Introduction, Main Points, Outro."
                  className="flex-1 w-full p-6 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm leading-relaxed"
                />
              </div>
            )}

            {activeTab === 'thumbnail' && (
              <div className="space-y-8 max-w-2xl">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Thumbnail URL</label>
                  <input 
                    type="text"
                    value={formData.thumbnailUrl}
                    onChange={e => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Preview</label>
                  <div className="aspect-video w-full bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                    {formData.thumbnailUrl ? (
                      <img 
                        src={formData.thumbnailUrl} 
                        alt="Thumbnail preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/1280/720')}
                      />
                    ) : (
                      <div className="text-center p-8">
                        <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">No thumbnail URL provided</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800">Performance Tracking</h4>
                    <p className="text-sm text-slate-500">Views every 24 hours after upload</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Views</p>
                      <p className="text-2xl font-black text-blue-600">
                        {formData.viewsHistory?.reduce((acc, curr) => acc + curr.views, 0).toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-[300px] w-full bg-white rounded-2xl border border-slate-100 p-4">
                  {formData.viewsHistory && formData.viewsHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formData.viewsHistory}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="views" 
                          stroke="#2563eb" 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <BarChart3 className="w-12 h-12 mb-2 opacity-20" />
                      <p>No analytics data available yet</p>
                      <p className="text-xs mt-1">Data starts collecting after video is published</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800">YouTube Comments</h4>
                  <button 
                    onClick={addMockComment}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Sync Comments
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.comments && formData.comments.length > 0 ? (
                    formData.comments.map(comment => (
                      <div key={comment.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                            {comment.author[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{comment.author}</p>
                            <p className="text-[10px] text-slate-400">{new Date(comment.publishedAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{comment.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>No comments found for this video</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50">
            {formData.id ? (
              <button
                type="button"
                onClick={() => onDelete?.(formData.id!)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            ) : <div />}
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                Save Plan
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-4 text-sm font-semibold transition-all border-b-2",
        active 
          ? "border-blue-600 text-blue-600" 
          : "border-transparent text-slate-500 hover:text-slate-700"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
