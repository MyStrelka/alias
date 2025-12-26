import { CheckCircle2, Crown, UserMinus, XCircle } from 'lucide-react';

import type { Player } from '@alias/shared';

import EllipsisText from './EllipsisText';
import Table from './Table/Table';
import Td from './Table/Td';
import Thead from './Table/Thead';
import Trow from './Table/Trow';

const PlayerTable = ({
  players,
  selfId,
  isHost,
  onToggleReady,
  onKick,
  gameStage,
}: any) => {
  const header = () => (
    <>
      <Thead text='Имя' />
      <Thead text='Очки' />
      <Thead text='Статус' />
      {isHost && <Thead text='' align='right' />}
    </>
  );

  const rows = () =>
    players.map((p: Player) => (
      <Trow key={p.id}>
        <Td classNames={['font-semibold', 'text-white']}>
          <div className='flex items-center gap-2'>
            {p.isHost && <Crown className='h-4 w-4 text-amber-400' />}
            <EllipsisText text={p.name} classNames='max-w-48' />
            {p.id === selfId && (
              <span className='badge bg-white/20 border-white/30 text-xs'>
                Вы
              </span>
            )}
            {!p.online && (
              <span className='text-[10px] text-red-400 ml-1'>(offline)</span>
            )}
          </div>
        </Td>
        <Td classNames={['font-mono']}>{p.score}</Td>
        <Td classNames={['font-mono']}>
          {gameStage === 'lobby' ? (
            <button
              onClick={() => onToggleReady?.(p.id)}
              disabled={p.id !== selfId}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                p.ready
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-white/10 text-gray-400 border border-white/10'
              } ${p.id !== selfId ? 'cursor-default opacity-80' : 'hover:bg-opacity-80'}`}
            >
              {p.ready ? (
                <CheckCircle2 className='h-3 w-3' />
              ) : (
                <XCircle className='h-3 w-3' />
              )}
              {p.ready ? 'Готов' : 'Не готов'}
            </button>
          ) : (
            <span className='text-xs text-gray-400'>В игре</span>
          )}
        </Td>
        {isHost && (
          <Td classNames={['text-right']}>
            {!p.isHost && (
              <button
                onClick={() => {
                  if (confirm(`Исключить игрока ${p.name}?`)) onKick?.(p.id);
                }}
                className='p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors'
                title='Исключить'
              >
                <UserMinus className='h-4 w-4' />
              </button>
            )}
          </Td>
        )}
      </Trow>
    ));

  return <Table header={header} rows={rows} />;
};

export default PlayerTable;
