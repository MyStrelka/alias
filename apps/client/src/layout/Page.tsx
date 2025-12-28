import type React from 'react';

const Page = ({ children }: { children: React.ReactNode }) => (
  <div className='w-full lg:flex-grow gap-6 animate-fade-in h-full'>
    {children}
  </div>
);

export default Page;
