// 単語カードのデータベース操作
import { supabase } from './supabase.js';

// 端末の日付で「今日」を YYYY-MM-DD の形にする（日本時間で判定するため）
export function todayString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export async function addCard({ word, meaning, example, example_ja }) {
  const { error } = await supabase
    .from('cards')
    .insert({ word, meaning, example, example_ja, due_date: todayString() });
  if (error) throw error;
}
