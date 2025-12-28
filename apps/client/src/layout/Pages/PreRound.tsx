import type { Team } from '@alias/shared';

import ActivePlayers from '../../components/ActivePlayers';
import { TEAM_THEMES, useGameStore } from '../../store/gameStore';
import { soundManager } from '../../utils/soundManager';

const PreRound = ({
  speaker,
  listener,
  currentTeamId,
  teams,
  settings,
  selfId,
  actions,
  readyMap,
  activeChallenge,
  isSpeakerReady,
  isListenerReady,
}: any) => {
  const currentTeam = teams.find((t: Team) => t.id === currentTeamId);
  const teamTheme = currentTeam
    ? TEAM_THEMES[currentTeam.themeIndex % TEAM_THEMES.length]
    : null;
  const isSpeaker = selfId === speaker?.id;
  const isListener = selfId === listener?.id;
  const amIInvolved = isSpeaker || isListener;

  const requiredReady = isSpeakerReady && isListenerReady;
  const showStartButton = isSpeaker && requiredReady;

  return (
    <div className='glass-panel p-6 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden'>
      {teamTheme && (
        <div className={`absolute inset-0 opacity-10 ${teamTheme.bg}`} />
      )}
      <div className='relative z-10 w-full max-w-lg text-center space-y-8'>
        <div>
          <div className='badge mb-2'>
            Раунд #{useGameStore.getState().round.roundNumber}
          </div>
          <h2 className='text-3xl font-bold text-white'>Приготовьтесь!</h2>
          {settings.mode === 'team' && currentTeam && (
            <p className={`text-xl font-bold mt-2 ${teamTheme?.text}`}>
              Ход команды: {currentTeam.name}
            </p>
          )}
        </div>

        {activeChallenge && (
          <div className='mt-4 p-4 border-2 border-rose-500/50 bg-rose-500/10 rounded-xl shadow-lg animate-pulse'>
            <p className='text-sm font-black text-rose-300 uppercase'>
              🔥 УСЛОЖНЕНИЕ РАУНДА!
            </p>
            <p className='text-xl font-bold text-white mt-1'>
              {activeChallenge}
            </p>
          </div>
        )}
        <ActivePlayers
          speaker={speaker}
          listener={listener}
          isSpeakerReady={!!isSpeakerReady}
          isListenerReady={!!isListenerReady}
        />
        <div className='pt-6'>
          {amIInvolved ? (
            !requiredReady ? (
              <button
                onClick={() => {
                  soundManager.play('click');
                  actions.markRoundReady(selfId!, !readyMap[selfId!]);
                }}
                className={`w-full py-4 rounded-xl text-xl font-bold transition-all transform active:scale-95 ${readyMap[selfId!] ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'}`}
              >
                {readyMap[selfId!] ? 'ОЖИДАНИЕ ПАРТНЕРА' : 'Я ГОТОВ!'}
              </button>
            ) : // 🔥 ПРАВКА: Убран network.sendToHost, теперь actions.startGameRound/emit
            showStartButton ? (
              <button
                onClick={() => {
                  soundManager.play('start');
                  actions.startGameRound();
                }}
                className='w-full py-4 rounded-xl text-xl font-bold bg-accent-main hover:bg-accent-main/80 text-white shadow-[0_0_20px_rgba(var(--accent-main),0.4)] animate-pulse'
              >
                ПОЕХАЛИ!
              </button>
            ) : (
              <div className='text-gray-400'>
                Ждем запуска раунда объясняющим...
              </div>
            )
          ) : (
            <div className='p-4 bg-black/20 rounded-lg text-gray-400'>
              Вы наблюдаете за этим раундом
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreRound;
