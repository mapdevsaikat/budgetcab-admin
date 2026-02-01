'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LogIn } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (!data.user || !data.session) {
        setError('Login failed. Please try again.');
        setLoading(false);
        return;
      }

      // Explicitly refresh session to ensure cookies are properly set
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.warn('[Login] Refresh session warning:', refreshError.message);
      }

      // Wait for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify session is established
      const { data: { session: finalSession } } = await supabase.auth.getSession();

      if (!finalSession) {
        setError('Session not established. Please try again.');
        setLoading(false);
        return;
      }

      // Redirect to dashboard - use correct route path
      window.location.replace('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/android-chrome-192x192.png"
              alt="BudgetCab Logo"
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-extrabold">
            <span className="text-maahi-brand">Budget</span>
            <span className="text-maahi-warn">C</span>
            <span className="text-maahi-brand">ab</span>
            <span className="text-maahi-brand"> Admin</span>
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage bookings and drivers
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-maahi-accent focus:border-maahi-accent sm:text-sm transition duration-150 ease-in-out"
                  placeholder="admin@BudgetCab.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-maahi-accent focus:border-maahi-accent sm:text-sm transition duration-150 ease-in-out"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-maahi-brand hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maahi-brand disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out shadow-md hover:shadow-lg"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="h-5 w-5 text-maahi-warn group-hover:text-yellow-300 transition ease-in-out duration-150" aria-hidden="true" />
              </span>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link href="/register" className="font-medium text-maahi-accent hover:text-gray-700 transition-colors">
              Create admin account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
