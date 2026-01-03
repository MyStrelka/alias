import type { WordLog } from '@seaborn/shared/alias';

import Table from '../../../components/Table/Table';
import Td from '../../../components/Table/Td';
import Thead from '../../../components/Table/Thead';
import Trow from '../../../components/Table/Trow';
import { useGameStore } from '../../../store/games/alilasStore';

const GameLeftBar = () => {
  const { round, stage, actions } = useGameStore();
  return (
    <div className='glass-panel flex flex-col p-4'>
      <Table
        header={() => (
          <>
            <Thead
              text={`Слова раунда (${(round.wordLog as WordLog[]).filter((w) => w.score === 1).length} слов отгадано)`}
            />
            <Thead text='' />
          </>
        )}
        rows={() =>
          round.wordLog.map((log, i) => (
            <Trow key={`word_${i}`}>
              <Td
                classNames={[
                  'text-right',
                  'font-bold',
                  'text-sm',
                  'animate-fade-in',
                  log.score === -1
                    ? 'text-red-400'
                    : log.score === 1
                      ? 'text-green-400'
                      : '',
                ]}
              >
                {log.word}
              </Td>
              <Td>
                <input
                  type='number'
                  value={log.score}
                  onChange={(e) => {
                    const targetScore = e.target.value;
                    if (['-1', '0', '1'].includes(targetScore)) {
                      const score = Number(targetScore) as -1 | 0 | 1;
                      actions.wordAdjustment(i, score);
                    }
                  }}
                  className='input-glass w-24 text-center font-mono'
                  min={-1}
                  max={1}
                  step={1}
                  disabled={stage !== 'play-adjustment'}
                />
              </Td>
            </Trow>
          ))
        }
      />
    </div>
  );
};

export default GameLeftBar;
