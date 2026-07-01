-- 본인 문의 수정 (답변 대기 상태만)
create policy "inquiry_update_own" on public.inquiry
  for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending');

-- 본인 문의 삭제 (답변 대기 상태만)
create policy "inquiry_delete_own" on public.inquiry
  for delete
  using (auth.uid() = user_id and status = 'pending');
