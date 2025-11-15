'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Check, X, Loader2, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameError, setUsernameError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Debounced username check
  useEffect(() => {
    if (!formData.username || formData.username.length < 3) {
      setUsernameStatus('idle');
      setUsernameError('');
      return;
    }

    setUsernameStatus('checking');
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(formData.username)}`);
        const data = await response.json();
        
        if (data.available) {
          setUsernameStatus('available');
          setUsernameError('');
        } else {
          setUsernameStatus('taken');
          setUsernameError('Username is already taken');
        }
      } catch (error) {
        setUsernameStatus('idle');
        setUsernameError('');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usernameStatus === 'taken') {
      toast({
        title: 'Error',
        description: 'Username is already taken. Please choose another one.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast({
        title: 'Success',
        description: 'Account created successfully! Please log in.',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to register',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8 fade-in">
          <div className="mx-auto mb-6 flex justify-center">
            <Image
              src="/icons/Social-connect-icon.png"
              alt="SocialConnect"
              width={160}
              height={160}
              className="object-contain transform hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Join SocialConnect</h1>
          <p className="text-gray-400">Create your account and start connecting</p>
        </div>

        <div className="glass-strong rounded-2xl p-8 fade-in">
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-gray-300">First Name</Label>
                  <Input
                    id="first_name"
                    name="reg_first_name"
                    type="text"
                    placeholder="John"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="bg-white/5 border-white/10 focus:border-purple-500/50 text-white placeholder:text-gray-500 rounded-xl"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-gray-300">Last Name</Label>
                  <Input
                    id="last_name"
                    name="reg_last_name"
                    type="text"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="bg-white/5 border-white/10 focus:border-purple-500/50 text-white placeholder:text-gray-500 rounded-xl"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  name="reg_email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border-white/10 focus:border-purple-500/50 text-white placeholder:text-gray-500 h-12 rounded-xl"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    name="reg_username"
                    type="text"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                    className={`bg-white/5 border-white/10 focus:border-purple-500/50 text-white placeholder:text-gray-500 h-12 rounded-xl pr-10 ${
                      usernameStatus === 'taken' ? 'border-red-500/50' : usernameStatus === 'available' ? 'border-green-500/50' : ''
                    }`}
                    autoComplete="off"
                    required
                    minLength={3}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus === 'checking' && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
                    {usernameStatus === 'available' && <Check className="h-5 w-5 text-green-500" />}
                    {usernameStatus === 'taken' && <X className="h-5 w-5 text-red-500" />}
                  </div>
                </div>
                {usernameError && <p className="text-sm text-red-400 mt-1">{usernameError}</p>}
                {usernameStatus === 'available' && <p className="text-sm text-green-400 mt-1">Username is available!</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="reg_new_password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-white/5 border-white/10 focus:border-purple-500/50 text-white placeholder:text-gray-500 h-12 rounded-xl pr-12"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="reg_confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="bg-white/5 border-white/10 focus:border-purple-500/50 text-white placeholder:text-gray-500 h-12 rounded-xl pr-12"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-premium h-12 text-base font-semibold" 
                disabled={isLoading || usernameStatus === 'taken' || usernameStatus === 'checking'}
              >
                {isLoading ? (
                  <>
                    <div className="spinner mr-2 h-5 w-5"></div>
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-white hover:text-gray-300 font-semibold transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


