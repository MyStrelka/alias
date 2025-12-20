import { useEffect } from 'react';
import { Rocket, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Player } from '@alias/shared';
import { soundManager } from '../utils/soundManager';
import AccentButton from '../components/AccentButton';

const Victory = ({ winner, players, onRestart }: any) => {
  useEffect(() => {
    soundManager.play('win');
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;
    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        }),
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        }),
      );
    }, 250);
    return () => clearInterval(interval);
  }, []);
  const bestSpeaker = [...players].sort(
    (a: Player, b: Player) => b.explained - a.explained,
  )[0];
  const bestGuesser = [...players].sort(
    (a: Player, b: Player) => b.guessed - a.guessed,
  )[0];

  return (
    <div className='max-w-4xl mx-auto pt-10 animate-fade-in text-center px-4'>
      <div className='glass-panel p-10 border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.2)]'>
        <div className='inline-flex p-4 rounded-full bg-amber-500/20 mb-6'>
          <Crown className='h-16 w-16 text-amber-400' />
        </div>
        <h2 className='text-6xl font-black text-white mb-2 uppercase tracking-tight'>
          Победа!
        </h2>
        <p className='text-2xl text-amber-200 mb-10 font-bold'>
          {(winner as any)?.name || 'Неизвестный'} забирает кубок!
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-10'>
          <div className='bg-white/5 rounded-xl p-6 border border-white/10'>
            <p className='text-gray-400 text-sm uppercase font-bold mb-2'>
              Оратор от бога
            </p>
            <div className='text-2xl font-bold text-white mb-1'>
              {bestSpeaker?.name}
            </div>
            <div className='text-accent-main'>
              {bestSpeaker?.explained} слов объяснено
            </div>
          </div>
          <div className='bg-white/5 rounded-xl p-6 border border-white/10'>
            <p className='text-gray-400 text-sm uppercase font-bold mb-2'>
              Телепат
            </p>
            <div className='text-2xl font-bold text-white mb-1'>
              {bestGuesser?.name}
            </div>
            <div className='text-accent-main'>
              {bestGuesser?.guessed} слов угадано
            </div>
          </div>
        </div>
        <AccentButton
          onClick={onRestart}
          className='mx-auto px-10 py-4 text-xl'
        >
          <Rocket className='h-6 w-6' /> Вернуться в лобби
        </AccentButton>
      </div>
    </div>
  );
};

export default Victory;
