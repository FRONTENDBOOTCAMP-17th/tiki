'use client';

import Button from '@/components/Button';

export default function ButtonExamplePage() {
  return (
    <main className='flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black'>
      <p className='mt-2 text-muted-foreground'>Button 컴포넌트</p>

      {/* Filled Variants */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Filled Variants</h2>

        <div className='flex flex-wrap gap-4'>
          <Button variant='primary'>Primary</Button>

          <Button variant='secondary'>Secondary</Button>

          <Button variant='accent'>Accent</Button>

          <Button variant='danger'>Danger</Button>
        </div>
      </section>

      {/* Outline Variants */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Outline Variants</h2>

        <div className='flex flex-wrap gap-4'>
          <Button variant='outline'>Outline</Button>

          <Button variant='outlinePrimary'>Outline Primary</Button>

          <Button variant='outlineSecondary'>Outline Secondary</Button>

          <Button variant='outlineAccent'>Outline Accent</Button>

          <Button variant='outlineDanger'>Outline Danger</Button>
        </div>
      </section>

      {/* Sizes */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Sizes</h2>

        <div className='flex items-center gap-4'>
          <Button size='sm'>Small</Button>

          <Button size='md'>Medium</Button>

          <Button size='lg'>Large</Button>
        </div>
      </section>

      {/* Disabled */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Disabled</h2>

        <div className='flex flex-wrap gap-4'>
          <Button disabled>Primary</Button>

          <Button variant='secondary' disabled>
            Secondary
          </Button>

          <Button variant='accent' disabled>
            Accent
          </Button>

          <Button variant='danger' disabled>
            Danger
          </Button>

          <Button variant='outline' disabled>
            Outline
          </Button>

          <Button variant='outlinePrimary' disabled>
            Outline Primary
          </Button>

          <Button variant='outlineSecondary' disabled>
            Outline Secondary
          </Button>

          <Button variant='outlineAccent' disabled>
            Outline Accent
          </Button>

          <Button variant='outlineDanger' disabled>
            Outline Danger
          </Button>
        </div>
      </section>

      {/* Loading */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Loading</h2>

        <div className='flex flex-wrap gap-4'>
          <Button loading>Loading</Button>

          <Button variant='secondary' loading>
            Loading
          </Button>

          <Button variant='accent' loading>
            Loading
          </Button>

          <Button variant='danger' loading>
            Loading
          </Button>

          <Button variant='outlinePrimary' loading>
            Loading
          </Button>
        </div>
      </section>

      {/* Full Width */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Full Width</h2>

        <div className='max-w-md space-y-3'>
          <Button fullWidth>Full Width</Button>

          <Button variant='secondary' fullWidth>
            Full Width
          </Button>

          <Button variant='accent' fullWidth>
            Full Width
          </Button>

          <Button variant='danger' fullWidth>
            Full Width
          </Button>

          <Button variant='outlinePrimary' fullWidth>
            Full Width
          </Button>
        </div>
      </section>

      {/* Click Events */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Event Test</h2>

        <div className='flex flex-wrap gap-4'>
          <Button onClick={() => console.log('Primary')}>Console Log</Button>

          <Button variant='danger' onClick={() => alert('삭제')}>
            Alert
          </Button>
        </div>
      </section>

      {/* Real World */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Real World Examples</h2>

        <div className='flex flex-wrap gap-4'>
          <Button>저장하기</Button>

          <Button variant='secondary'>취소</Button>

          <Button variant='accent'>티켓 예매</Button>

          <Button variant='danger'>삭제하기</Button>

          <Button variant='outlinePrimary'>수정하기</Button>

          <Button variant='outlineDanger'>회원 탈퇴</Button>
        </div>
      </section>
    </main>
  );
}
