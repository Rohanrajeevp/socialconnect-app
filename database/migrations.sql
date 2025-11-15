-- SocialConnect Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(30) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    website VARCHAR(255),
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'followers_only')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    CONSTRAINT username_format CHECK (username ~* '^[a-zA-Z0-9_]+$'),
    CONSTRAINT bio_length CHECK (char_length(bio) <= 160)
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT,
    category VARCHAR(20) DEFAULT 'general' CHECK (category IN ('general', 'announcement', 'question')),
    is_active BOOLEAN DEFAULT true,
    like_count INTEGER DEFAULT 0 CHECK (like_count >= 0),
    comment_count INTEGER DEFAULT 0 CHECK (comment_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT content_length CHECK (char_length(content) > 0 AND char_length(content) <= 280)
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT comment_length CHECK (char_length(content) > 0 AND char_length(content) <= 500)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention')),
    content TEXT NOT NULL,
    related_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    related_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refresh tokens table (for JWT refresh token management)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    is_blacklisted BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment like_count
CREATE OR REPLACE FUNCTION increment_like_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement like_count
CREATE OR REPLACE FUNCTION decrement_like_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to increment comment_count
CREATE OR REPLACE FUNCTION increment_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement comment_count
CREATE OR REPLACE FUNCTION decrement_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for like_count
CREATE TRIGGER trigger_increment_like_count
    AFTER INSERT ON likes
    FOR EACH ROW EXECUTE FUNCTION increment_like_count();

CREATE TRIGGER trigger_decrement_like_count
    AFTER DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION decrement_like_count();

-- Triggers for comment_count
CREATE TRIGGER trigger_increment_comment_count
    AFTER INSERT ON comments
    FOR EACH ROW EXECUTE FUNCTION increment_comment_count();

CREATE TRIGGER trigger_decrement_comment_count
    AFTER DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION decrement_comment_count();

-- Function to create notification on like
CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
BEGIN
    -- Get the post author
    SELECT author_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
    
    -- Don't create notification if user likes their own post
    IF post_author_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, content, related_user_id, related_post_id)
        VALUES (
            post_author_id,
            'like',
            'liked your post',
            NEW.user_id,
            NEW.post_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification on comment
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
BEGIN
    -- Get the post author
    SELECT author_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
    
    -- Don't create notification if user comments on their own post
    IF post_author_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, content, related_user_id, related_post_id)
        VALUES (
            post_author_id,
            'comment',
            'commented on your post',
            NEW.user_id,
            NEW.post_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification on follow
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, type, content, related_user_id)
    VALUES (
        NEW.following_id,
        'follow',
        'started following you',
        NEW.follower_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for notifications
CREATE TRIGGER trigger_like_notification
    AFTER INSERT ON likes
    FOR EACH ROW EXECUTE FUNCTION create_like_notification();

CREATE TRIGGER trigger_comment_notification
    AFTER INSERT ON comments
    FOR EACH ROW EXECUTE FUNCTION create_comment_notification();

CREATE TRIGGER trigger_follow_notification
    AFTER INSERT ON follows
    FOR EACH ROW EXECUTE FUNCTION create_follow_notification();

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Note: You'll need to set up appropriate RLS policies based on your security requirements
-- For now, we're using service role key in the API which bypasses RLS


