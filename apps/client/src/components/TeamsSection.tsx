import { Plus } from 'lucide-react';

import type { Player, Team } from '@seaborn/shared/alias';
import { SETTINGS } from '@seaborn/shared/alias';

import { TEAM_THEMES, useGameStore } from '../store/games/alilasStore';
import { useRootStore } from '../store/rootStore';
import TeamActions from './TeamActions';

const TeamsSection = ({
  teams,
  players,
  onCreateTeam,
  isHost,
}: {
  teams: Team[];
  players: Player[];
  onCreateTeam: () => void;
  isHost: boolean;
}) => {
  const { actions } = useGameStore();
  const { deviceId } = useRootStore();
  const getTeamPlayers = (teamId: string) =>
    players.filter((p: Player) => p.teamId === teamId);
  const getTeamScore = (team: Team) =>
    getTeamPlayers(team.id).reduce(
      (sum: number, p: Player) => sum + p.score,
      0,
    );
  const currentPlayerTeam = players.find(
    (p: Player) => p.deviceId === deviceId,
  )?.teamId;

  return (
    <div className='space-y-3'>
      {teams
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((team: Team) => {
          const teamPlayers = getTeamPlayers(team.id);
          const theme = TEAM_THEMES[team.themeIndex % TEAM_THEMES.length];
          const isCurrentTeam = currentPlayerTeam === team.id;
          const teamScore = getTeamScore(team);

          return (
            <div
              key={team.id}
              className={`glass-panel p-4 border ${theme.border} ${theme.bg} relative transition-transform hover:scale-[1.01]`}
            >
              <div className='flex items-center justify-between mb-3'>
                <div>
                  <h4 className={`text-lg font-bold ${theme.text}`}>
                    {team.name}
                  </h4>
                  <p className={`text-sm font-bold opacity-70 ${theme.text}`}>
                    {teamScore} очк.
                  </p>
                </div>
                <div>
                  <TeamActions
                    text={isCurrentTeam ? 'Ваша команда' : 'Вступить'}
                    disabled={isCurrentTeam}
                    onClilck={() => actions.joinTeam(deviceId, team.id)}
                    classNames={[theme.bg, theme.border, theme.text]}
                  />
                  {isHost && !isCurrentTeam && teams.length > 1 && (
                    <TeamActions
                      text='Удалить'
                      disabled={isCurrentTeam}
                      onClilck={() => actions.deleteTeam(team.id)}
                      classNames={[theme.bg, theme.border, theme.text, 'ml-2']}
                    />
                  )}
                </div>
              </div>
              <div className='flex flex-wrap gap-2'>
                {teamPlayers.map((p: Player) => (
                  <span
                    key={p.deviceId}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-black/20 text-white/90 border border-white/10`}
                  >
                    {p.name}
                  </span>
                ))}
                {teamPlayers.length === 0 && (
                  <span className='text-xs italic opacity-50'>Пусто</span>
                )}
              </div>
            </div>
          );
        })}
      {isHost && teams.length < SETTINGS.MAX_TEAM_COUNT && (
        <button
          onClick={onCreateTeam}
          className='w-full btn-glass border-dashed border-white/30 text-gray-400 hover:border-accent-main hover:text-accent-main transition flex items-center justify-center gap-2 py-3'
        >
          <Plus className='h-4 w-4' /> Создать команду
        </button>
      )}
    </div>
  );
};

export default TeamsSection;
