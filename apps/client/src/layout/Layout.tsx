import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  header?: ReactNode;
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
}

export const Layout = ({
  children,
  leftSidebar,
  rightSidebar,
}: LayoutProps) => {
  return (
    <div className='min-h-screen w-full'>
      <div className='container mx-auto px-4 py-4 md:py-6'>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-12 items-start'>
          <aside className='order-2 flex flex-col gap-4 lg:order-1 lg:col-span-3'>
            <div className='sticky top-4 space-y-4'>{leftSidebar}</div>
          </aside>
          <main className='order-1 flex min-h-[50vh] flex-col gap-4 lg:order-2 lg:col-span-6'>
            {children}
          </main>
          <aside className='order-3 flex flex-col gap-4 lg:order-3 lg:col-span-3'>
            <div className='sticky top-4 space-y-4'>{rightSidebar}</div>
          </aside>
        </div>
      </div>
    </div>
  );
};
