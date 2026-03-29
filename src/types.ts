export type VideoStatus = 'idea' | 'scripting' | 'filming' | 'editing' | 'published';

export interface ViewEntry {
  date: string;
  views: number;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  publishedAt: string;
  authorProfileImageUrl?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  status: VideoStatus;
  scheduledDate: string; // ISO string
  tags: string[];
  notes: string;
  script: string;
  thumbnailUrl?: string;
  viewsHistory: ViewEntry[];
  comments: Comment[];
  youtubeId?: string;
}

export const STATUS_COLORS: Record<VideoStatus, string> = {
  idea: 'bg-slate-100 text-slate-700 border-slate-200',
  scripting: 'bg-blue-100 text-blue-700 border-blue-200',
  filming: 'bg-amber-100 text-amber-700 border-amber-200',
  editing: 'bg-purple-100 text-purple-700 border-purple-200',
  published: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export const STATUS_LABELS: Record<VideoStatus, string> = {
  idea: 'Idea',
  scripting: 'Scripting',
  filming: 'Filming',
  editing: 'Editing',
  published: 'Published',
};
