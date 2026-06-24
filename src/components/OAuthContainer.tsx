import Button from '@/components/Button';

export default function OAuthContainer({
  googleSignin,
  kakaoSignin,
}: {
  googleSignin: () => Promise<void>;
  kakaoSignin: () => Promise<void>;
}) {
  return (
    <div className='space-y-3'>
      <form action={googleSignin}>
        <Button
          type='submit'
          variant='outline'
          fullWidth
          className='border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold'
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 20 20'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M18.8 10.2083C18.8 9.55825 18.7417 8.93325 18.6333 8.33325H10V11.8833H14.9333C14.7167 13.0249 14.0667 13.9916 13.0917 14.6416V16.9499H16.0667C17.8 15.3499 18.8 12.9999 18.8 10.2083Z'
              fill='#4285F4'
            />
            <path
              d='M9.99998 19.1667C12.475 19.1667 14.55 18.35 16.0667 16.95L13.0917 14.6417C12.275 15.1917 11.2333 15.525 9.99998 15.525C7.61665 15.525 5.59165 13.9167 4.86665 11.75H1.81665V14.1167C3.32498 17.1083 6.41665 19.1667 9.99998 19.1667Z'
              fill='#34A853'
            />
            <path
              d='M4.86659 11.7416C4.68325 11.1916 4.57492 10.6083 4.57492 9.99993C4.57492 9.3916 4.68325 8.80827 4.86659 8.25827V5.8916H1.81659C1.19159 7.12493 0.833252 8.5166 0.833252 9.99993C0.833252 11.4833 1.19159 12.8749 1.81659 14.1083L4.19159 12.2583L4.86659 11.7416Z'
              fill='#FBBC05'
            />
            <path
              d='M9.99998 4.48325C11.35 4.48325 12.55 4.94992 13.5083 5.84992L16.1333 3.22492C14.5417 1.74159 12.475 0.833252 9.99998 0.833252C6.41665 0.833252 3.32498 2.89159 1.81665 5.89159L4.86665 8.25825C5.59165 6.09159 7.61665 4.48325 9.99998 4.48325Z'
              fill='#EA4335'
            />
          </svg>
          Google로 계속하기
        </Button>
      </form>
      <form action={kakaoSignin}>
        <Button
          type='submit'
          fullWidth
          className='bg-[#FEE500] text-black hover:bg-[#eed70d] font-semibold'
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 20 20'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M10 2.5C14.8325 2.5 18.75 5.55333 18.75 9.32083C18.75 13.0875 14.8325 16.1408 10 16.1408C9.51881 16.1411 9.0381 16.1105 8.56083 16.0492L4.8875 18.4517C4.47 18.6725 4.3225 18.6483 4.49417 18.1075L5.2375 15.0425C2.8375 13.8258 1.25 11.7175 1.25 9.32083C1.25 5.55417 5.1675 2.5 10 2.5Z'
              fill='black'
            />
          </svg>
          카카오로 계속하기
        </Button>
      </form>
    </div>
  );
}
