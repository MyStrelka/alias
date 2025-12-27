import { UserMinus } from 'lucide-react';

const KickUser = ({
  playerName,
  onClick,
}: {
  playerName: string;
  onClick: () => void;
}) => (
  <button
    onClick={() => {
      if (confirm(`Исключить игрока ${playerName}?`)) onClick?.();
    }}
    className='p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors'
    title='Исключить'
  >
    <UserMinus className='h-4 w-4' />
  </button>
);

export default KickUser;
