export type Role = 'student' | 'teacher' | 'admin'

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
