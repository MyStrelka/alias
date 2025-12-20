import type {
  GameState,
  GameStateClient,
  GameStateActions,
} from '@alias/shared';
import { Volume2, VolumeX, LogOut } from 'lucide-react';

const Header = ({
  stage,
  roomId,
  actions,
  isMuted,
}: Pick<
  GameState & GameStateClient & GameStateActions,
  'stage' | 'roomId' | 'actions' | 'isMuted'
>) => {
  return (
    stage !== 'login' && (
      <header className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'>
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
          {roomId && (
            <div className='hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400'>
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
              if (confirm('Вы уверены, что хотите покинуть игру?')) {
                actions.leaveGame();
              }
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
