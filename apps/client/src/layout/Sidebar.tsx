import type React from 'react';

const Sidebar = ({ children }: { children: React.ReactNode }) => (
  <div className='w-full lg:w-1/3 flex-shrink-0'>
    <div className='flex flex-col gap-4'>{children}</div>
  </div>
);

export default Sidebar;
