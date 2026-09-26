// ログイン・ログアウト・ログイン状態の監視
import { supabase } from './supabase.js';

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ログイン状態が変わるたびに callback(user または null) を呼ぶ
export function onAuthChange(callback) {
  supabase.auth.getSession().then(({ data }) => callback(data.session?.user ?? null));
  supabase.auth.onAuthStateChange((_event, session) => callback(session?.user ?? null));
}
