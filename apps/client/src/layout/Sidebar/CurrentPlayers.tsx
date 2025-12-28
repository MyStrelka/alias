import type { Player } from '@alias/shared';

import EllipsisText from '../../components/EllipsisText';

const CurrentPlayers = ({
  listener,
  speaker,
}: {
  listener?: Player;
  speaker?: Player;
}) => {
  return (
    <>
      {speaker && (
        <div className='glass-panel p-4 flex items-center justify-between gap-4 text-right'>
          <span className='text-gray-400 flex-none'>Объясняет</span>
          <EllipsisText
            classNames='font-bold text-white block max-w-80'
            text={speaker.name}
          />
        </div>
      )}
      {listener && (
        <div className='glass-panel p-4 flex items-center justify-between gap-4 text-right'>
          <span className='text-gray-400 flex-none'>Отгадывает</span>
          <EllipsisText
            classNames='font-bold text-white block max-w-80'
            text={listener?.name}
          />
        </div>
      )}
    </>
  );
};

export default CurrentPlayers;
