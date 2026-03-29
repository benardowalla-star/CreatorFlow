import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Plus, 
  Sparkles, 
  Video as VideoIcon, 
  TrendingUp,
  Search,
  Settings,
  Bell,
  ChevronRight,
  Loader2,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar } from './components/Calendar';
import { VideoModal } from './components/VideoModal';
import { Video, VideoStatus, STATUS_COLORS, STATUS_LABELS } from './types';
import { generateVideoIdeas, getTrendingTopics } from './services/geminiService';
import { cn } from './lib/utils';

export default function App() {
  const [videos, setVideos] = useState<Video[]>(() => {
    const saved = localStorage.getItem('creatorflow_videos');
    return saved ? JSON.parse(saved) : [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Partial<Video> | null>(null);
  const [niche, setNiche] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{title: string, description: string}[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<{topic: string, reason: string}[]>([]);

  useEffect(() => {
    localStorage.setItem('creatorflow_videos', JSON.stringify(videos));
  }, [videos]);

  const handleAddVideo = (date?: Date) => {
    setEditingVideo({ 
      scheduledDate: (date || new Date()).toISOString(),
      status: 'idea',
      script: '',
      thumbnailUrl: '',
      viewsHistory: [],
      comments: [],
      tags: []
    });
    setIsModalOpen(true);
  };

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    setIsModalOpen(true);
  };

  const handleSaveVideo = (video: Video) => {
    setVideos(prev => {
      const exists = prev.find(v => v.id === video.id);
      if (exists) {
        return prev.map(v => v.id === video.id ? video : v);
      }
      return [...prev, video];
    });
    setIsModalOpen(false);
    setEditingVideo(null);
  };

  const handleDeleteVideo = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    setIsModalOpen(false);
    setEditingVideo(null);
  };

  const handleGenerateIdeas = async () => {
    if (!niche) return;
    setIsGenerating(true);
    try {
      const [ideas, trends] = await Promise.all([
        generateVideoIdeas(niche),
        getTrendingTopics(niche)
      ]);
      setAiSuggestions(ideas);
      setTrendingTopics(trends);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const stats = {
    total: videos.length,
    published: videos.filter(v => v.status === 'published').length,
    inProgress: videos.filter(v => v.status !== 'published' && v.status !== 'idea').length,
    ideas: videos.filter(v => v.status === 'idea').length,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 p-6 hidden lg:flex flex-col gap-8 z-30">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <VideoIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">CreatorFlow</span>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active />
          <NavItem icon={<CalendarIcon className="w-5 h-5" />} label="Calendar" />
          <NavItem icon={<TrendingUp className="w-5 h-5" />} label="Analytics" />
          <NavItem icon={<Bell className="w-5 h-5" />} label="Notifications" />
          <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" />
        </nav>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Pro Tip</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Consistency is key! Try to schedule at least 2 videos per week to grow faster.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Content Strategy</h1>
            <p className="text-slate-500">Welcome back! You have {stats.inProgress} videos in production.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search videos..." 
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all w-64"
              />
            </div>
            <button 
              onClick={() => handleAddVideo()}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              New Video
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          <StatCard label="Total Videos" value={stats.total} color="blue" />
          <StatCard label="Published" value={stats.published} color="emerald" />
          <StatCard label="In Progress" value={stats.inProgress} color="amber" />
          <StatCard label="Ideas" value={stats.ideas} color="slate" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Schedule</h2>
              <div className="flex gap-2">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className={cn("w-2 h-2 rounded-full", STATUS_COLORS[key as VideoStatus].split(' ')[0])} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <Calendar 
              videos={videos} 
              onAddVideo={handleAddVideo} 
              onEditVideo={handleEditVideo} 
            />
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            {/* Trending Topics Widget */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl shadow-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <Flame className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-bold">Trending Topics</h2>
              </div>
              <div className="space-y-4">
                {trendingTopics.length > 0 ? (
                  trendingTopics.map((trend, i) => (
                    <div key={i} className="group cursor-default">
                      <h4 className="text-sm font-bold text-slate-100 mb-1">{trend.topic}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{trend.reason}</p>
                      <div className="h-px bg-slate-800 mt-3 group-last:hidden" />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4 italic">
                    Generate ideas to see trending topics in your niche
                  </p>
                )}
              </div>
            </div>

            {/* AI Idea Generator */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold">AI Idea Generator</h2>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    value={niche}
                    onChange={e => setNiche(e.target.value)}
                    placeholder="Enter your niche (e.g. Tech, Cooking)" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={handleGenerateIdeas}
                  disabled={isGenerating || !niche}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Generate Ideas & Trends
                </button>
              </div>

              <div className="mt-8 space-y-4">
                {aiSuggestions.map((suggestion, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i}
                    className="group p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer"
                    onClick={() => {
                      setEditingVideo({
                        title: suggestion.title,
                        description: suggestion.description,
                        status: 'idea',
                        scheduledDate: new Date().toISOString(),
                        script: '',
                        thumbnailUrl: '',
                        viewsHistory: [],
                        comments: [],
                        tags: []
                      });
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                        {suggestion.title}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {suggestion.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <VideoModal 
          video={editingVideo}
          onClose={() => {
            setIsModalOpen(false);
            setEditingVideo(null);
          }}
          onSave={handleSaveVideo}
          onDelete={handleDeleteVideo}
        />
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
      active 
        ? "bg-blue-50 text-blue-600" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    )}>
      {icon}
      {label}
    </button>
  );
}

function StatCard({ label, value, color }: { label: string, value: number, color: 'blue' | 'emerald' | 'amber' | 'slate' }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100",
  };

  return (
    <div className={cn("p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md", colors[color])}>
      <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}
