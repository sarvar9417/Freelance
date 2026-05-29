export type Role = 'student' | 'teacher' | 'admin'

export type DifficultyLevel = 1 | 2 | 3 | 4

export type Methodology = 'web_kvest' | 'flipped' | 'pbl' | 'muammoli'

export type TaskType = 'standard' | 'web_kvest' | 'flipped_homework' | 'flipped_inclass' | 'pbl_project' | 'muammoli_problem'

export const METHODOLOGY_LABELS: Record<Methodology, { label: string; short: string; icon: string; color: string }> = {
  web_kvest: { label: 'Veb-Kvest', short: 'Kvest', icon: '🌐', color: 'text-cyan-400' },
  flipped: { label: 'Flipped Classroom', short: 'Flipped', icon: '🔄', color: 'text-violet-400' },
  pbl: { label: "Project-Based Learning", short: 'PBL', icon: '📐', color: 'text-orange-400' },
  muammoli: { label: "Muammoli ta'lim", short: 'Muammoli', icon: '🧩', color: 'text-rose-400' },
}

export const TASK_TYPE_LABELS: Record<TaskType, { label: string; icon: string }> = {
  standard: { label: 'Standart topshiriq', icon: '📋' },
  web_kvest: { label: 'Veb-Kvest topshirig\'i', icon: '🌐' },
  flipped_homework: { label: 'Flipped — Uy vazifasi', icon: '🏠' },
  flipped_inclass: { label: 'Flipped — Sinf ishi', icon: '🏫' },
  pbl_project: { label: 'PBL — Loyiha ishi', icon: '📐' },
  muammoli_problem: { label: "Muammoli vaziyat", icon: '🧩' },
}

export interface ForumPost {
  id: string
  title: string
  content: string
  category: string
  author_id: string
  author_name: string
  author_avatar: string
  likes: number
  dislikes: number
  comment_count: number
  created_at: string
  updated_at: string
}

export interface ForumComment {
  id: string
  post_id: string
  author_id: string
  author_name: string
  author_avatar: string
  content: string
  likes: number
  created_at: string
}

export interface ForumLike {
  id: string
  post_id: string | null
  comment_id: string | null
  user_id: string
  type: 'like' | 'dislike'
}

export interface DailyQuote {
  id: string
  text: string
  author: string
  is_active: boolean
  created_at: string
}

export interface SuccessStory {
  id: string
  title: string
  content: string
  author_name: string
  approved: boolean
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  age: number | null
  role: Role
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface Course {
  id: string
  teacher_id: string
  title: string
  description: string
  full_description: string | null
  category: string
  level: string
  emoji: string | null
  image_url: string | null
  preview_video_url: string | null
  methodologies: string[]
  is_published: boolean
  status: 'pending' | 'approved' | 'rejected' | 'active'
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  order_num: number
  video_url: string | null
  content: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  course_id: string
  lesson_id: string | null
  title: string
  description: string | null
  deadline: string | null
  max_score: number
  allowed_formats: string[] | null
  difficulty_level: number
  order_index: number
  task_type: string
  template_data: Record<string, unknown> | null
  created_at: string
}

export interface Submission {
  id: string
  task_id: string
  student_id: string
  status: 'pending' | 'graded' | 'revision'
  score: number | null
  feedback: string | null
  file_urls: string[] | null
  grade: string | null
  assessment_criteria: Record<string, unknown> | null
  submitted_at: string
  reviewed_at: string | null
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  progress: number
  enrolled_at: string
  last_accessed: string | null
  completed_at: string | null
}

export interface LessonProgress {
  id: string
  student_id: string
  lesson_id: string
  course_id: string
  completed_at: string
}

export interface UserXP {
  user_id: string
  total_xp: number
  current_level: number
}

export interface UserStreak {
  user_id: string
  current_streak: number
  longest_streak: number
  last_activity_date: string
}

export interface CourseReview {
  id: string
  course_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  data: Record<string, unknown> | null
  created_at: string
}

export interface MasterClass {
  id: string
  title: string
  description: string | null
  speaker_name: string
  speaker_bio: string | null
  datetime: string
  link: string | null
  max_participants: number | null
  is_online: boolean
  created_by: string
  created_at: string
}

export interface TeamFinding {
  id: string
  user_id: string
  title: string
  description: string
  skills_needed: string[]
  project_type: string | null
  contact_info: string | null
  is_active: boolean
  created_at: string
}
