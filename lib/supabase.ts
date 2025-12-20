import { createClient } from '@supabase/supabase-js';

// Vite'da değişkenlere import.meta.env ile erişilir
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Eğer değişkenler eksikse hata ver (Hata ayıklamayı kolaylaştırır)
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL veya Anon Key bulunamadı! .env.local dosyasını kontrol edin.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);