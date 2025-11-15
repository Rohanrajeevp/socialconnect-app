'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isEmail = formData.emailOrUsername.includes('@');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [isEmail ? 'email' : 'username']: formData.emailOrUsername,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data);
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
      router.push('/feed');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to log in',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
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
          <h1 className="text-4xl font-bold text-white mb-2">SocialConnect</h1>
          <p className="text-gray-400">Welcome back! Log in to continue</p>
        </div>

        <div className="glass-strong rounded-2xl p-8 fade-in">
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername" className="text-gray-300">Email or Username</Label>
                <Input
                  id="emailOrUsername"
                  type="text"
                  placeholder="Enter your email or username"
                  value={formData.emailOrUsername}
                  onChange={(e) => setFormData({ ...formData, emailOrUsername: e.target.value })}
                  className="bg-white/5 border-white/10 focus:border-purple-500/50 text-white placeholder:text-gray-500 h-12 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-white/5 border-white/10 focus:border-purple-500/50 text-white placeholder:text-gray-500 h-12 rounded-xl pr-12"
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

              <Button 
                type="submit" 
                className="w-full btn-premium h-12 text-base font-semibold" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner mr-2 h-5 w-5"></div>
                    Logging in...
                  </>
                ) : (
                  'Log In'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-white hover:text-gray-300 font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


