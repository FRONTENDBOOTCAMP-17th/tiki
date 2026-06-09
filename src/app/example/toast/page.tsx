'use client';

import Button from '@/components/Button';
import useToast from '@/hooks/useToast';

export default function ButtonExamplePage() {
  const toast = useToast();
  return (
    <main className='flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black'>
      <p className='mt-2 text-muted-foreground'>Toast 컴포넌트</p>

      <section className='flex gap-2'>
        <Button variant='primary' onClick={() => toast.success('성공 메시지!')}>
          성공
        </Button>
        <Button
          variant='danger'
          onClick={() => toast.error('에러 메시지!', 1000)}
        >
          에러
        </Button>
        <Button variant='accent' onClick={() => toast.warning('경고 메시지!')}>
          경고
        </Button>
        <Button variant='secondary' onClick={() => toast.info('정보 메시지!')}>
          정보
        </Button>
      </section>
    </main>
  );
}
