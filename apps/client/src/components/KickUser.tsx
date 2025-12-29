import { UserMinus } from 'lucide-react';

import useModalStore from '../store/modalStore';

const KickUser = ({
  playerName,
  onClick,
}: {
  playerName: string;
  onClick: () => void;
}) => {
  const { openModal } = useModalStore();
  return (
    <button
      onClick={() => {
        openModal({
          type: 'confirmation',
          confirmation: `Исключить игрока ${playerName}?`,
          onConfirm: onClick,
        });
      }}
      className='p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors'
      title='Исключить'
    >
      <UserMinus className='h-4 w-4' />
    </button>
  );
};
export default KickUser;
