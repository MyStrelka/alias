import type { Player } from '@alias/shared';

import ActivePlayers from '../../components/ActivePlayers';

const Players = ({
  listener,
  speaker,
  isSpeakerReady,
  isListenerReady,
}: {
  listener?: Player;
  speaker?: Player;
  isSpeakerReady: boolean;
  isListenerReady: boolean;
}) => {
  return (
    listener &&
    speaker && (
      <div className='glass-panel p-4 flex items-center justify-center text-center gap-4'>
        <ActivePlayers
          listener={listener}
          speaker={speaker}
          isSpeakerReady={isSpeakerReady}
          isListenerReady={isListenerReady}
        />
      </div>
    )
  );
};

export default Players;
