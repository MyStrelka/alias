import { Crown, Trophy } from 'lucide-react';

import type { Player, Team } from '@seaborn/shared/alias';

import EllipsisText from '../../components/EllipsisText';
import KickUser from '../../components/KickUser';
import TeamActions from '../../components/TeamActions';
import { TEAM_THEMES, useGameStore } from '../../store/games/alilasStore';
import { useRootStore } from '../../store/rootStore';

const LeaderBoard = ({
  speaker,
  listener,
}: {
  speaker?: Player;
  listener?: Player;
}) => {
  const { players, settings, teams, isHost, actions, round } = useGameStore();
  const { deviceId } = useRootStore();
  const isNotActiveUser =
    speaker?.deviceId !== deviceId && listener?.deviceId !== deviceId;

  return (
    <div className='glass-panel p-4 flex-1'>
      <h3 className='text-white font-bold mb-4 flex items-center gap-2'>
        <Trophy className='h-4 w-4 text-amber-400' /> Лидерборд
      </h3>
      <div className='space-y-3'>
        {settings.mode === 'team'
          ? teams
              .sort((a: Team, b: Team) => b.score - a.score)
              .map((t: Team) => {
                const teamPlayers = players.filter(
                  (p: Player) => p.teamId === t.id,
                );
                const theme = TEAM_THEMES[t.themeIndex % TEAM_THEMES.length];
                const isActive = t.id === round.currentTeamId;
                const isMyTeam =
                  deviceId !== null &&
                  teamPlayers.map((p) => p.deviceId).includes(deviceId);
                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-lg border ${theme.border} ${theme.bg} ${isActive ? 'ring-2 ring-white' : ''} flex flex-col`}
                  >
                    <div className='flex justify-between items-center mb-1'>
                      <EllipsisText classNames={theme.text} text={t.name} />
                      {!isMyTeam && isNotActiveUser && (
                        <TeamActions
                          text={isMyTeam ? 'Ваша команда' : 'Вступить'}
                          disabled={isMyTeam}
                          onClilck={() => actions.joinTeam(deviceId, t.id)}
                          confirmationText={`Вы хотите перейти в команду ${t.name || t.id}`}
                          classNames={['mr-2']}
                        />
                      )}
                      <span className='font-bold text-white text-lg'>
                        {t.score}
                      </span>
                    </div>
                    <div className='flex flex-col gap-1'>
                      {teamPlayers.map((p: Player) => (
                        <div className='flex items-center'>
                          {isHost &&
                            (p.isHost ? (
                              <Crown className='h-4 w-4 text-amber-400 ml-[8px] mr-[8px]' />
                            ) : (
                              <KickUser
                                playerName={p.name}
                                onClick={() => actions.kickPlayer(p.deviceId)}
                              />
                            ))}
                          <EllipsisText
                            classNames='bg-black/20 px-1.5 py-0.5 rounded text-gray-300 flex gap-1 ml-2'
                            text={`${p.name}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
          : players
              .slice()
              .sort((a: Player, b: Player) => b.score - a.score)
              .map((p: Player) => (
                <div
                  key={p.deviceId}
                  className={`flex justify-between items-center p-2 border-b border-white/5 last:border-0 ${p.deviceId === speaker?.deviceId ? 'bg-white/5 rounded' : ''}`}
                >
                  <EllipsisText
                    classNames={`text-sm pr-2 ${p.deviceId === speaker?.deviceId ? 'text-accent-main font-bold' : 'text-gray-300'}`}
                    text={`${p.name}${p.deviceId === deviceId ? ' (Вы)' : ''}`}
                  />

                  <span
                    className={`font-mono font-bold ${p.score < 0 ? 'text-red-400' : 'text-white'}`}
                  >
                    {p.score}
                  </span>
                </div>
              ))}
      </div>
    </div>
  );
};

export default LeaderBoard;
