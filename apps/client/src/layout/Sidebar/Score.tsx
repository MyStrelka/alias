import { Crown } from 'lucide-react';

import type { Player, Team } from '@alias/shared';

import EllipsisText from '../../components/EllipsisText';
import KickUser from '../../components/KickUser';
import Tile from '../../components/Tile';
import { TEAM_THEMES, useGameStore } from '../../store/gameStore';

const Score = () => {
  const { players, settings, teams, isHost, actions } = useGameStore();

  return (
    <div className='space-y-4'>
      <Tile title='Счет'>
        <div className='space-y-2'>
          {settings.mode === 'team'
            ? teams.map((t: Team) => {
                const theme = TEAM_THEMES[t.themeIndex % TEAM_THEMES.length];
                return (
                  <div
                    key={t.id}
                    className={`flex justify-between p-2 rounded border ${theme.border} ${theme.bg}`}
                  >
                    <EllipsisText classNames={theme.text} text={t.name} />
                    <span className='font-bold text-white'>{t.score}</span>
                  </div>
                );
              })
            : players
                .sort((a: Player, b: Player) => b.score - a.score)
                .map((p: Player) => (
                  <div
                    key={p.id}
                    className='flex justify-between items-center p-2 border-b border-white/5 last:border-0'
                  >
                    {isHost &&
                      (!p.isHost ? (
                        <KickUser
                          playerName={p.name}
                          onClick={() => actions.kickPlayer(p.id)}
                        />
                      ) : (
                        <Crown className='h-4 w-4 text-amber-400 ml-[8px] mr-[8px]' />
                      ))}
                    <EllipsisText
                      classNames='text-gray-300 pr-2 pl-2'
                      text={p.name}
                    />
                    <span className='font-bold text-white'>{p.score}</span>
                  </div>
                ))}
        </div>
      </Tile>
    </div>
  );
};

export default Score;
