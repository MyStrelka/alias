import type React from 'react';

import CommonSettings from '../components/CommonSettings';
import useUiStore from '../store/uiStore';

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const { isSettingsOpen } = useUiStore();
  return (
    <div className='w-full lg:w-1/3 flex-shrink-0'>
      <div className='flex flex-col gap-4'>
        {isSettingsOpen && (
          <div className='glass-panel p-5 space-y-6 h-fit animate-fade-in'>
            <CommonSettings />
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
