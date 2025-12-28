const JoinTeam = ({
  disabled,
  teamId,
  onJoinTeam,
  classNames,
}: {
  disabled: boolean;
  teamId: string;
  onJoinTeam: (teamId: string) => void;
  classNames?: string[];
}) => (
  <button
    onClick={() => onJoinTeam(teamId)}
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

export default JoinTeam;
