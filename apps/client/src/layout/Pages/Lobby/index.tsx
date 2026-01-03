import { toast } from 'react-hot-toast';
import { Play, XCircle } from 'lucide-react';

import { SETTINGS, type Team } from '@seaborn/shared/alias';

import AccentButton from '../../../components/AccentButton';
import TeamsSection from '../../../components/TeamsSection';
import Tile from '../../../components/Tile';
import { useGameStore } from '../../../store/games/alilasStore';
import { soundManager } from '../../../utils/soundManager';
import { Layout } from '../../Layout';
import LobbyLeftBar from './LeftBar';
import LobbyRightBar from './RightBar';

const Lobby = () => {
  const { settings, players, teams, isHost, actions } = useGameStore();

  const isTeamMode = settings.mode === 'team';
  const canStartGame =
    players.length >= 2 &&
    (!isTeamMode ||
      teams.filter((t: Team) => t.playerIds.length >= 2).length >= 2);
  const teamValidationError =
    isTeamMode &&
    teams.some((t: Team) => t.playerIds.length > 0 && t.playerIds.length < 2);

  return (
    <Layout leftSidebar={<LobbyLeftBar />} rightSidebar={<LobbyRightBar />}>
      <div className='space-y-4'>
        {settings.mode === 'team' && (
          <Tile title='Команды'>
            <TeamsSection
              teams={teams}
              players={players}
              onCreateTeam={() => actions.createTeam()}
              isHost={isHost}
            />
            {teamValidationError && (
              <div className='mt-3 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm flex items-center gap-2'>
                <XCircle className='h-4 w-4' /> В каждой команде должно быть
                минимум 2 игрока
              </div>
            )}{' '}
            {teams.length >= SETTINGS.MAX_TEAM_COUNT && (
              <div className='mt-3 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm flex items-center gap-2'>
                <XCircle className='h-4 w-4' />
                Максимум {SETTINGS.MAX_TEAM_COUNT} команд
              </div>
            )}
          </Tile>
        )}

        <div className='flex justify-end pt-2'>
          {isHost ? (
            <div className='flex flex-col items-end gap-3'>
              {!canStartGame && (
                <div className='text-right'>
                  <p className='text-xs text-red-400 font-bold uppercase tracking-wide mb-1'>
                    Нельзя начать игру
                  </p>
                  <p className='text-sm text-gray-400'>
                    {players.length < 2
                      ? 'Нужно минимум 2 игрока'
                      : isTeamMode
                        ? 'Минимум две команды должны иметь по ≥ 2 игрока'
                        : 'Готово к старту!'}
                  </p>
                </div>
              )}
              <AccentButton
                onClick={() => {
                  if (!canStartGame) {
                    toast.error('Соберите команды!');
                    return;
                  }
                  soundManager.play('start');
                  actions.startGame();
                }}
                disabled={!canStartGame}
                className={`px-8 py-3 text-lg ${!canStartGame ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
              >
                <Play className='h-6 w-6 fill-current' /> Начать игру
              </AccentButton>
            </div>
          ) : (
            <div className='text-gray-400 italic animate-pulse'>
              Ожидание хоста...
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Lobby;
