import { LogOut, Settings, Volume2, VolumeX } from 'lucide-react';

import { useGameStore } from '../store/gameStore';
import useModalStore from '../store/modalStore';
import useUiStore from '../store/uiStore';

const Header = () => {
  const { actions, stage, roomId, isMuted, isHost } = useGameStore();
  const { openModal } = useModalStore();
  const { isSettingsOpen, togglelSettings } = useUiStore();

  return (
    stage !== 'login' && (
      <header className='mx-auto min-w-[480px] max-w-[1440px] px-8 py-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <img
            src='/logo.jpg'
            alt='Logo'
            className='h-10 w-10 object-contain'
          />
          <span className='font-bold text-xl tracking-tight hidden md:block'>
            SeaBornAlias
          </span>
        </div>
        <div className='flex items-center gap-4'>
          {isHost && (
            <button
              onClick={() => togglelSettings()}
              className='p-2 rounded-full hover:bg-white/10 transition-colors'
              title='Настройки'
            >
              <Settings
                className={`h-6 w-6 text-${isSettingsOpen ? 'white' : 'gray-400'}`}
              />
            </button>
          )}
          {roomId && (
            <div className='md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400'>
              <span>ID:</span>
              <span className='text-white select-all'>
                {roomId.replace('alias-', '')}
              </span>
            </div>
          )}
          <button
            onClick={actions.toggleMute}
            className='p-2 rounded-full hover:bg-white/10 transition-colors'
            title='Вкл/Выкл звук'
          >
            {isMuted ? (
              <VolumeX className='h-5 w-5 text-gray-400' />
            ) : (
              <Volume2 className='h-5 w-5 text-white' />
            )}
          </button>
          <button
            onClick={() => {
              openModal({
                type: 'confirmation',
                confirmation: 'Вы уверены, что хотите покинуть игру?',
                onConfirm: () => actions.leaveGame(),
              });
            }}
            className='p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-red-400'
            title='Покинуть игру'
          >
            <LogOut className='h-5 w-5' />
          </button>
        </div>
      </header>
    )
  );
};

export default Header;
