import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { LogIn, PlugZap } from 'lucide-react';

import AccentButton from '../components/AccentButton';
import { useGameStore } from '../store/gameStore';

const Login = () => {
  const [roomId, setRoomId] = useState('');
  const { actions, user } = useGameStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    if (roomFromUrl) {
      setRoomId(roomFromUrl);
      toast.success('Код комнаты введен!');
    }
  }, []);

  return (
    <div className='max-w-xl mx-auto pt-10 px-4 animate-fade-in'>
      <div className='flex flex-col items-center gap-6 text-center'>
        <div className='relative'>
          <div className='absolute inset-0 bg-accent-main/40 blur-3xl rounded-full opacity-50'></div>
          <img
            src='/logo.jpg'
            alt='Logo'
            className='relative h-24 w-24 object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]'
          />
        </div>
        <div>
          {/* 🔥 ПРАВКА: Название и Слоган */}
          <h1 className='text-5xl font-black tracking-tight text-white mb-2'>
            SeaBornAlias
          </h1>
          <p className='text-gray-400 text-lg'>Будущие бывшие друзья</p>
        </div>

        <div className='glass-panel w-full p-8 space-y-8'>
          <div className='flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10'>
            {user ? (
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  {user.avatar ? (
                    <img
                      src={`${user.avatar}`}
                      className='h-10 w-10 rounded-full border border-white/20'
                    />
                  ) : (
                    <div className='h-10 w-10 rounded-full bg-accent-main flex items-center justify-center font-bold'>
                      {user.name?.[0] || 'U'}
                    </div>
                  )}
                  <div className='text-left'>
                    <div className='text-sm font-bold text-white'>
                      {user.name}
                    </div>
                    <div className='text-xs text-green-400'>Онлайн</div>
                  </div>
                </div>
                <button
                  onClick={() => actions.logout()}
                  className='text-xs text-gray-400 hover:text-white underline'
                >
                  Выйти
                </button>
              </div>
            ) : (
              <div className='flex flex-col gap-2'>
                <p className='text-xs text-gray-400 uppercase font-bold text-left mb-1'>
                  Войти через:
                </p>
                <div className='grid grid-cols-2 gap-2'>
                  <button
                    onClick={() => actions.loginWithProvider('google')}
                    className='flex items-center justify-center gap-2 p-2 rounded-lg bg-white text-black font-bold text-sm hover:bg-gray-100 transition'
                  >
                    Google
                  </button>
                  <button
                    onClick={() => actions.loginWithProvider('discord')}
                    className='flex items-center justify-center gap-2 p-2 rounded-lg bg-[#5865F2] text-white font-bold text-sm hover:bg-[#4752C4] transition'
                  >
                    Discord
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className='text-left'>
            <label className='text-xs font-bold uppercase text-gray-500 ml-1 mb-1 block'>
              Ваше имя в игре
            </label>
            <input
              value={user?.nickName || ''}
              onChange={(e) => actions.setUserNickName(e.target.value)}
              placeholder='Как вас зовут?'
              className='input-glass w-full text-lg'
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 relative'>
            <div className='absolute left-1/2 top-0 bottom-0 w-px bg-white/10 hidden md:block' />

            {/* 🔥 ПРАВКА: Центрирование кнопок */}
            <div className='flex flex-col gap-3 items-center text-center'>
              <h3 className='text-sm font-bold text-gray-400 uppercase'>
                Новая игра
              </h3>
              <AccentButton
                onClick={() => actions.createRoom()}
                disabled={!user?.nickName}
                className='h-12 w-full'
              >
                <PlugZap className='h-5 w-5' /> Создать
              </AccentButton>
            </div>

            {/* 🔥 ПРАВКА: Центрирование кнопок */}
            <div className='flex flex-col gap-3 items-center text-center'>
              <h3 className='text-sm font-bold text-gray-400 uppercase'>
                Присоединиться
              </h3>
              <div className='flex gap-2 w-full'>
                <input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder='1234'
                  className='input-glass w-full h-12 text-center font-mono tracking-widest text-xl'
                  maxLength={4}
                />
                <button
                  onClick={() => actions.joinRoom(roomId)}
                  disabled={!user?.name || !roomId}
                  className='btn-glass px-4 bg-white/10 hover:bg-white/20 disabled:opacity-50'
                >
                  <LogIn className='h-5 w-5' />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
