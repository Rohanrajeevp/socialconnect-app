export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  location?: string;
  is_active: boolean;
  is_admin: boolean;
  email_verified: boolean;
  profile_visibility: 'public' | 'private' | 'followers_only';
  created_at: string;
  updated_at: string;
  last_login?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
}

export interface Post {
  id: string;
  content: string;
  author_id: string;
  author?: User;
  image_url?: string;
  category: 'general' | 'announcement' | 'question';
  is_active: boolean;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  is_liked?: boolean;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  user?: User;
  post_id: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  content: string;
  related_user_id?: string;
  related_user?: User;
  related_post_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}


