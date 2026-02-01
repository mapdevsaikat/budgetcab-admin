'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('[Register] Starting registration...');

      // Sign up with admin role in metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            mobile: mobile,
            role: 'admin', // Set admin role in raw_user_meta_data
          },
        },
      });

      console.log('[Register] SignUp response:', {
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: signUpError?.message
      });

      if (signUpError) {
        console.error('[Register] SignUp error:', signUpError);
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        console.error('[Register] No user in response');
        setError('Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      console.log('[Register] Registration successful, user created:', data.user.id);

      // Check if signUp returned a session (happens when email confirmation is disabled)
      let session = data.session;

      // If no session from signUp, try to sign in
      if (!session) {
        console.log('[Register] No session from signUp, attempting auto-login...');

        // Wait a moment for the user to be fully processed
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log('[Register] SignIn response:', {
          hasSession: !!signInData?.session,
          error: signInError?.message
        });

        if (signInError) {
          console.error('[Register] Auto-login error:', signInError);
          setError(`Registration successful but auto-login failed: ${signInError.message}. Please log in manually.`);
          setLoading(false);
          return;
        }

        session = signInData.session;
      }

      if (!session) {
        console.error('[Register] No session after signup/signin');
        setError('Registration successful but session not established. Please log in manually.');
        setLoading(false);
        return;
      }

      console.log('[Register] Session established:', !!session);

      // Wait longer for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify session one more time
      const { data: { session: verifiedSession } } = await supabase.auth.getSession();
      console.log('[Register] Verified session:', !!verifiedSession);

      // Check cookies
      const cookies = document.cookie;
      console.log('[Register] Cookies:', cookies);

      if (!verifiedSession) {
        console.error('[Register] Session verification failed');
        setError('Session not established. Please log in manually.');
        setLoading(false);
        return;
      }

      console.log('[Register] Session verified, redirecting to dashboard...');
      console.log('[Register] Final cookies:', document.cookie);

      // Redirect to bookings after successful registration
      window.location.href = '/bookings';
    } catch (err: any) {
      console.error('[Register] Registration error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/android-chrome-192x192.png"
              alt="BudgetCab Logo"
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold">
            <span className="text-maahi-brand">Budget</span>
            <span className="text-maahi-warn">C</span>
            <span className="text-maahi-brand">ab</span>
            <span className="text-maahi-brand"> Admin</span>
          </h1>
          <p className="mt-2 text-gray-600">Create admin account</p>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-maahi-brand focus:border-maahi-brand"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-maahi-brand focus:border-maahi-brand"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-maahi-brand focus:border-maahi-brand"
              />
            </div>
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-maahi-brand focus:border-maahi-brand"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-maahi-brand focus:border-maahi-brand"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-maahi-brand hover:bg-maahi-brand/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maahi-brand disabled:opacity-50"
            >
              {loading ? 'Creating account...' : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Admin Account
                </>
              )}
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-maahi-brand hover:text-maahi-brand/80">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

