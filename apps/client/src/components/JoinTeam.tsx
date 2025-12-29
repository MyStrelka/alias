import useModalStore from '../store/modalStore';

const JoinTeam = ({
  disabled,
  teamId,
  onJoinTeam,
  classNames,
  joinTeamConfirmation,
  teamName,
}: {
  disabled: boolean;
  teamId: string;
  onJoinTeam: (teamId: string) => void;
  classNames?: string[];
  joinTeamConfirmation?: boolean;
  teamName?: string;
}) => {
  const { openModal } = useModalStore();
  return (
    <button
      onClick={() => {
        if (joinTeamConfirmation) {
          openModal({
            type: 'confirmation',
            confirmation: `Вы хотите перейти в команду ${teamName || teamId}`,
            onConfirm: () => onJoinTeam(teamId),
          });
        } else {
          onJoinTeam(teamId);
        }
      }}
      disabled={disabled}
      className={`rounded-lg px-3 py-1 text-xs font-semibold transition btn-glass ${
        classNames
          ? `${classNames.join(' ')} border opacity-100`
          : 'opacity-70 hover:opacity-100'
      }`}
    >
      {disabled ? 'Ваша команда' : 'Вступить'}
    </button>
  );
};

export default JoinTeam;
