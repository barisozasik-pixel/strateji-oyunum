drop function if exists public.save_game_state(bigint, jsonb);
create or replace function public.save_game_state(expected_revision bigint, next_data jsonb)
returns table(saved_revision bigint, saved_updated_at timestamptz)
language plpgsql
set search_path = public
as $$
begin
  -- 1. Önce güncellemeyi yapıyoruz
  update public.game_state
     set data = next_data,
         revision = revision + 1,
         updated_at = now()
   where id = 1
     and revision = expected_revision;
  -- 2. Eğer hiçbir satır güncellenmediyse (gerçekten uyuşmazlık varsa) hata fırlatıyoruz
  if not found then
    raise exception 'Eşzamanlılık hatası: Veritabanındaki oyun durumu sizinkinden daha güncel (Beklenen Revision: %)', expected_revision;
  end if;
  -- 3. Güncelleme başarılıysa, yeni veriyi döndürüyoruz
  return query select revision, updated_at from public.game_state where id = 1;
end;
$$;
grant execute on function public.save_game_state(bigint, jsonb) to authenticated;
-- 4. REALTIME YAYINI
-- Tablonuzdaki değişiklikleri Supabase Realtime ile yayınlamak için
-- Eğer bu tablo zaten realtime'da ise PostgreSQL uyarı verebilir, uyarıyı görmezden gelebilirsiniz.
alter publication supabase_realtime add table public.game_state;
