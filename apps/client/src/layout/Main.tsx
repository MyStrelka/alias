import type React from 'react';

const Main = ({ children }: { children: React.ReactNode }) => (
  <main className='mx-auto min-w-[480px] max-w-[1440px] gap-6 px-4 py-4 md:py-8 pb-20 flex flex-wrap lg:flex-nowrap'>
    {children}
  </main>
);

export default Main;
