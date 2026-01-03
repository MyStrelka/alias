import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Turnstile } from '@marsidev/react-turnstile';
import { Share2, Sparkles, Trash2 } from 'lucide-react';

import { type Mode } from '@seaborn/shared/alias';

import CommonSettings from '../../../components/CommonSettings';
import { useGameStore } from '../../../store/games/alilasStore';

const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITEKEY;

const LobbyLeftBar = () => {
  const { roomId, actions, customWords, isHost, customTopic } = useGameStore();

  const [capchaStatus, setCapchaStatus] = useState<
    'ready' | 'solved' | 'expired' | 'error'
  >('ready');

  const [topic, setTopic] = useState('');

  const [generationState, setGenerationState] = useState<
    'ready' | 'inprogress'
  >('ready');

  const displayRoomId = roomId?.replace('alias-', '') || '...';

  const gameModes: { value: Mode; label: string }[] = [
    { value: 'team', label: 'Команды' },
    { value: 'solo_standard', label: 'Соло (Std)' },
    // { value: 'solo_all_vs_all', label: 'Соло (All)' },
  ];

  const renderAi = () =>
    customWords ? (
      <div className='flex items-center justify-between gap-2'>
        <div className='text-sm'>
          <span className='text-gray-400'>Тема: </span>
          <span className='text-white font-bold'>{customTopic}</span>
          <div className='text-xs text-green-400 mt-1'>
            Загружено {customWords.length} слов
          </div>
        </div>
        <button
          onClick={actions.clearCustomWords}
          className='p-2 hover:bg-white/10 rounded-lg text-red-400 transition'
        >
          <Trash2 className='h-5 w-5' />
        </button>
      </div>
    ) : (
      <div className='flex gap-2'>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder='Напр: Гарри Поттер'
          className='input-glass text-sm w-full'
          disabled={generationState === 'inprogress'}
        />
        <button
          onClick={() => {
            if (!topic) return toast.error('Введите тему');
            if (roomId) {
              setGenerationState('inprogress');
              actions
                .generateWordsAI(roomId, topic)
                .catch((e) => {
                  toast.error('Ошибка генерации слов');
                  console.error(e);
                })
                .finally(() => {
                  setGenerationState('ready');
                });
            }
          }}
          className='btn-glass bg-accent-main/20 hover:bg-accent-main/40 border-accent-main/50'
          disabled={!roomId || !topic || generationState === 'inprogress'}
        >
          <Sparkles
            className={`h-5 w-5 text-white ${generationState === 'inprogress' ? 'animate-pulse' : ''}`}
          />
        </button>
      </div>
    );

  return (
    <div className='glass-panel p-5 space-y-6 h-fit'>
      <div className='flex items-center justify-between border-b border-white/10 pb-4'>
        <div>
          <p className='text-xs text-gray-500 uppercase font-bold'>
            Код комнаты
          </p>
          <div className='flex items-center gap-3'>
            <h2 className='text-4xl font-mono font-black text-accent-main tracking-widest mt-1 select-all'>
              {displayRoomId}
            </h2>
            {isHost && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}/?room=${displayRoomId}`;
                  navigator.clipboard.writeText(url);
                  toast.success('Ссылка скопирована!');
                }}
                className='p-2 mt-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10'
              >
                <Share2 className='h-6 w-6' />
              </button>
            )}
          </div>
        </div>
      </div>

      {isHost && (
        <div className='glass-panel bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-accent-main/30 p-4 border-white/10 border-b'>
          <div className='flex items-center gap-2 mb-2 text-accent-main font-bold text-sm uppercase'>
            <Sparkles className='h-4 w-4' /> AI Генератор слов
          </div>
          {turnstileSiteKey && capchaStatus !== 'solved' && (
            <Turnstile
              id='turnstile-widget'
              siteKey='0x4AAAAAACKTYLmNzcwAmDwD'
              onError={() => setCapchaStatus('error')}
              onExpire={() => setCapchaStatus('expired')}
              onSuccess={() => setCapchaStatus('solved')}
            />
          )}
          {(!turnstileSiteKey || capchaStatus === 'solved') && renderAi()}
        </div>
      )}
      <CommonSettings gameModes={gameModes} />
    </div>
  );
};

export default LobbyLeftBar;
