'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Post } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Trash2, Send, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { AvatarRenderer } from '@/components/AvatarRenderer';

interface PostCardPremiumProps {
  post: Post;
  onDelete?: () => void;
  onLikeChange?: () => void;
}

export function PostCardPremium({ post, onDelete, onLikeChange }: PostCardPremiumProps) {
  const { user, accessToken } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comment_count);

  const handleLike = async () => {
    if (!user || isLiking) return;

    setIsLiking(true);
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: newLikedState ? 'POST' : 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
      }

      onLikeChange?.();
    } catch (error) {
      setIsLiked(!newLikedState);
      setLikeCount(prev => newLikedState ? prev - 1 : prev + 1);
      toast({
        title: 'Error',
        description: 'Failed to update like',
        variant: 'destructive',
      });
    } finally {
      setIsLiking(false);
    }
  };

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Map 'user' to 'author' for consistency
        const commentsWithAuthor = (data.comments || []).map((comment: any) => ({
          ...comment,
          author: comment.user || comment.author,
        }));
        setComments(commentsWithAuthor);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    const newShowState = !showComments;
    setShowComments(newShowState);
    if (newShowState && comments.length === 0) {
      loadComments();
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ content: commentText }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const data = await response.json();
      // The comment already has author data from API, but ensure it's there
      const commentWithAuthor = data.comment.author ? data.comment : {
        ...data.comment,
        author: {
          id: user!.id,
          username: user!.username,
          first_name: user!.first_name,
          last_name: user!.last_name,
          avatar_url: user!.avatar_url,
        },
      };
      setComments(prev => [commentWithAuthor, ...prev]);
      setCommentCount(prev => prev + 1);
      setCommentText('');
      toast({
        title: 'Success',
        description: 'Comment posted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });

      setShowDeleteDialog(false);
      onDelete?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    }
  };


  return (
    <div className="glass rounded-2xl overflow-hidden hover-scale fade-in group">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href={`/profile/${post.author?.id}`} className="flex items-center gap-3 flex-1">
          <AvatarRenderer
            avatarUrl={post.author?.avatar_url}
            fallbackName={`${post.author?.first_name} ${post.author?.last_name}`}
            className="h-11 w-11 ring-2 ring-white/10 group-hover:ring-white/30 transition-all"
          />
          <div className="flex-1">
            <p className="font-semibold text-white hover:text-gray-300 transition-colors">
              {post.author?.first_name} {post.author?.last_name}
            </p>
            <p className="text-sm text-gray-400">@{post.author?.username} · {formatDate(post.created_at)}</p>
          </div>
        </Link>
        
        {user?.id === post.author_id && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-white whitespace-pre-wrap leading-relaxed">{post.content}</p>
        </div>
      )}

      {/* Image - Preserved Original Dimensions */}
      {post.image_url && (
        <div className="px-4 pb-3">
          <img
            src={post.image_url}
            alt="Post image"
            className="rounded-xl w-full h-auto border border-white/10"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 px-4 py-3 border-t border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={!user || isLiking}
          className={`gap-2 transition-all duration-300 ${
            isLiked
              ? 'text-white hover:text-gray-300'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Heart
            className={`h-5 w-5 transition-all ${isLiked ? 'fill-current scale-110' : ''}`}
          />
          <span className="font-medium">{likeCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleComments}
          className={`gap-2 transition-all ${
            showComments ? 'text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">{commentCount}</span>
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-white/10 bg-white/5">
          {/* Comment Form */}
          {user && (
            <form onSubmit={handleSubmitComment} className="p-4 border-b border-white/10">
              <div className="flex gap-3">
                <AvatarRenderer
                  avatarUrl={user.avatar_url}
                  fallbackName={`${user.first_name} ${user.last_name}`}
                  className="h-9 w-9 ring-2 ring-white/10"
                />
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[80px] resize-none bg-white/5 border-white/10 focus:border-white/20 text-white placeholder:text-gray-500 rounded-xl"
                    maxLength={280}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{commentText.length}/280</span>
                    <Button
                      type="submit"
                      disabled={!commentText.trim() || isSubmittingComment}
                      size="sm"
                      className="btn-premium"
                    >
                      {isSubmittingComment ? (
                        <>
                          <div className="spinner mr-2 h-3 w-3"></div>
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Comment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoadingComments ? (
              <div className="p-8 text-center text-gray-400">
                <div className="spinner-lg mx-auto mb-2"></div>
                Loading comments...
              </div>
            ) : comments.length > 0 ? (
              <div className="divide-y divide-white/10">
                {comments.map((comment) => {
                  if (!comment.author) return null; // Skip comments without author data
                  return (
                    <div key={comment.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex gap-3">
                        <Link href={`/profile/${comment.author.id}`}>
                          <AvatarRenderer
                            avatarUrl={comment.author.avatar_url}
                            fallbackName={`${comment.author.first_name} ${comment.author.last_name}`}
                            className="h-9 w-9 ring-2 ring-white/10 hover:ring-white/30 transition-all"
                          />
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Link href={`/profile/${comment.author.id}`} className="font-semibold text-white text-sm hover:text-gray-300">
                              {comment.author.first_name} {comment.author.last_name}
                            </Link>
                            <span className="text-xs text-gray-400">@{comment.author.username}</span>
                            <span className="text-xs text-gray-500">· {formatDate(comment.created_at)}</span>
                          </div>
                          <p className="text-gray-300 text-sm whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="glass-strong rounded-2xl p-6 max-w-md w-full animate-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-red-500/10">
                <Trash2 className="h-6 w-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Delete Post?</h3>
                <p className="text-gray-400 text-sm mb-6">
                  This action cannot be undone. Your post will be permanently deleted.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteDialog(false)}
                    className="text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

