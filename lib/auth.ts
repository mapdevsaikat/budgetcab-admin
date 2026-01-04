import { createClient } from './supabase/server';
import { redirect } from 'next/navigation';

export async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user has admin role
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id);

  const profile = profiles && profiles.length > 0 ? profiles[0] : null;

  if (profileError || !profile || profile.role !== 'admin') {
    redirect('/login');
  }

  return { user, profile };
}

