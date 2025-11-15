'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Post, Comment } from '@/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const { user, accessToken, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`,
        } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setPost(data);
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPost();
      fetchComments();
    }
  }, [user, params.id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/posts/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      toast({
        title: 'Success',
        description: 'Comment posted successfully',
      });

      setNewComment('');
      fetchComments();
      fetchPost();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-8 max-w-2xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          ← Back
        </Button>

        {post && (
          <div className="space-y-6">
            <PostCard post={post} onDelete={() => router.push('/feed')} onLikeChange={fetchPost} />

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Comments</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmitComment} className="space-y-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {newComment.length}/500
                    </span>
                    <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                      {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </form>

                <div className="space-y-4 mt-6">
                  {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Link href={`/profile/${comment.user?.id}`}>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={comment.user?.avatar_url} alt={comment.user?.username} />
                            <AvatarFallback>
                              {getInitials(`${comment.user?.first_name} ${comment.user?.last_name}`)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Link href={`/profile/${comment.user?.id}`}>
                              <span className="font-semibold hover:underline">
                                {comment.user?.first_name} {comment.user?.last_name}
                              </span>
                            </Link>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}


