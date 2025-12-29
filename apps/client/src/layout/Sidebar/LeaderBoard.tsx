import { Crown, Trophy } from 'lucide-react';

import type { Player, Team } from '@alias/shared';

import EllipsisText from '../../components/EllipsisText';
import JoinTeam from '../../components/JoinTeam';
import KickUser from '../../components/KickUser';
import { TEAM_THEMES, useGameStore } from '../../store/gameStore';

const LeaderBoard = ({
  speaker,
  listener,
}: {
  speaker?: Player;
  listener?: Player;
}) => {
  const { players, settings, teams, isHost, actions, selfId, round } =
    useGameStore();
  const isNotActiveUser = speaker?.id !== selfId && listener?.id !== selfId;
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
                  selfId !== null &&
                  teamPlayers.map((p) => p.id).includes(selfId);
                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-lg border ${theme.border} ${theme.bg} ${isActive ? 'ring-2 ring-white' : ''} flex flex-col`}
                  >
                    <div className='flex justify-between items-center mb-1'>
                      <EllipsisText classNames={theme.text} text={t.name} />
                      {!isMyTeam && isNotActiveUser && (
                        <JoinTeam
                          disabled={isMyTeam}
                          onJoinTeam={actions.joinTeam}
                          teamId={t.id}
                          joinTeamConfirmation={true}
                          teamName={t.name}
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
                                onClick={() => actions.kickPlayer(p.id)}
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
                  key={p.id}
                  className={`flex justify-between items-center p-2 border-b border-white/5 last:border-0 ${p.id === speaker?.id ? 'bg-white/5 rounded' : ''}`}
                >
                  <EllipsisText
                    classNames={`text-sm pr-2 ${p.id === speaker?.id ? 'text-accent-main font-bold' : 'text-gray-300'}`}
                    text={`${p.name}${p.id === selfId ? ' (Вы)' : ''}`}
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
