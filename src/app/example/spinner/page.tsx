'use client';

import Spinner from '@/components/Spinner';

export default function ButtonExamplePage() {
  return (
    <main className='flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black'>
      <p className='mt-2 text-muted-foreground'>Button 컴포넌트</p>

      {/* Filled Variants */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Filled Variants</h2>

        <div className='flex flex-wrap gap-4'>
          <Spinner size='sm' color='primary' />
          <Spinner size='md' color='secondary' />
          <Spinner size='lg' color='accent' />
          <Spinner size='xl' color='danger' />
        </div>
      </section>
    </main>
  );
}
