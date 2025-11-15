'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { AvatarRenderer } from '@/components/AvatarRenderer';
import { Eye, EyeOff, Lock, Upload, X } from 'lucide-react';

export default function EditProfilePage() {
  const { user, accessToken, updateUser, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    bio: '',
    avatar_url: '',
    location: '',
    profile_visibility: 'public',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user) {
      setFormData({
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        location: user.location || '',
        profile_visibility: user.profile_visibility,
      });
      // Set initial avatar preview if user has an avatar
      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url);
      }
    }
  }, [user, isLoading, router]);

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'Error',
        description: 'File size exceeds 2MB limit',
        variant: 'destructive',
      });
      return;
    }

    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(user?.avatar_url || '');
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload avatar first if a new file is selected
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append('file', avatarFile);

        const uploadResponse = await fetch('/api/upload/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: avatarFormData,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || 'Failed to upload avatar');
        }

        const uploadData = await uploadResponse.json();
        
        // Update formData with new avatar URL
        formData.avatar_url = uploadData.url;
        
        toast({
          title: 'Avatar uploaded',
          description: 'Avatar uploaded successfully',
        });
      }

      // Update profile
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      updateUser(data);

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });

      router.push(`/profile/${user?.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'New password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      toast({
        title: 'Success',
        description: 'Password changed successfully. Please log in again.',
      });

      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Logout and redirect to login after a brief delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  maxLength={160}
                  placeholder="Tell us about yourself..."
                />
                <div className="text-sm text-muted-foreground text-right">
                  {(formData.bio || '').length}/160
                </div>
              </div>

              <div className="space-y-2">
                <Label>Profile Avatar</Label>
                <div className="flex items-center gap-4">
                  {/* Avatar Preview */}
                  <div className="flex-shrink-0">
                    {avatarPreview ? (
                      <div className="relative">
                        <AvatarRenderer
                          avatarUrl={avatarPreview}
                          fallbackName={`${formData.first_name} ${formData.last_name}`}
                          className="h-24 w-24 ring-2 ring-white/10"
                        />
                        {avatarFile && (
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                        <Upload className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleAvatarFileSelect}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label htmlFor="avatar-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Max 2MB. Formats: JPEG, PNG, WebP. Click "Save Changes" to upload.
                    </p>
                    {avatarFile && (
                      <p className="text-xs text-green-400">
                        ✓ Selected: {avatarFile.name} ({(avatarFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_visibility">Profile Visibility</Label>
                <select
                  id="profile_visibility"
                  value={formData.profile_visibility}
                  onChange={(e) => setFormData({ ...formData, profile_visibility: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="followers_only">Followers Only</option>
                </select>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="spinner mr-2 h-4 w-4"></div>
                      {avatarFile ? 'Uploading & Saving...' : 'Saving...'}
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Section */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Change Password</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="pr-12"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button 
                  type="submit" 
                  disabled={isChangingPassword}
                  variant="destructive"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="spinner mr-2 h-4 w-4"></div>
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Note: You will be logged out after changing your password and will need to log in again.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


