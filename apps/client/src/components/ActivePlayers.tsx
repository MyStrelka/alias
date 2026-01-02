import { CheckCircle2, Ear, Megaphone } from 'lucide-react';

import type { Player } from '@seaborn/shared/alias';

import Avatar from './Avatar';
import EllipsisText from './EllipsisText';

const ActivePlayers = ({
  speaker,
  listener,
  isSpeakerReady,
  isListenerReady,
}: {
  speaker: Player;
  listener: Player;
  isSpeakerReady: boolean;
  isListenerReady: boolean;
}) => {
  return (
    <div className='flex items-center justify-center gap-8'>
      <div className='flex flex-1 basis-0 min-w-0 flex-col items-center gap-2'>
        <div className='h-20 w-20 rounded-full bg-accent-main/20 border-2 border-accent-main flex items-center justify-center relative'>
          <Avatar
            avatar={speaker?.avatar}
            size={80}
            placeholder={<Megaphone className='h-8 w-8 text-accent-main' />}
          />

          {isSpeakerReady && (
            <div className='absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1'>
              <CheckCircle2 className='h-4 w-4 text-white' />
            </div>
          )}
        </div>

        <p className='text-sm text-gray-400 uppercase font-bold'>Объясняет</p>
        <EllipsisText
          classNames='text-lg font-bold text-white max-w-48'
          text={speaker?.name || '...'}
        />
      </div>
      <div className='h-px w-16 bg-white/20' />
      <div className='flex flex-1 basis-0 min-w-0 flex-col items-center gap-2'>
        <div className='h-20 w-20 rounded-full bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center relative'>
          <Avatar
            avatar={listener?.avatar}
            size={80}
            placeholder={<Ear className='h-8 w-8 text-indigo-400' />}
          />

          {isListenerReady && (
            <div className='absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1'>
              <CheckCircle2 className='h-4 w-4 text-white' />
            </div>
          )}
        </div>

        <p className='text-sm text-gray-400 uppercase font-bold'>Отгадывает</p>
        <EllipsisText
          classNames='text-lg font-bold text-white max-w-48'
          text={listener?.name || '...'}
        />
      </div>
    </div>
  );
};

export default ActivePlayers;
