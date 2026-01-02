import useModalStore from '../store/modalStore';

const TeamActions = ({
  disabled,
  classNames,
  confirmationText,
  text,
  onClilck,
}: {
  disabled: boolean;
  text: string;
  onClilck: () => void;
  classNames?: string[];
  confirmationText?: string;
}) => {
  const { openModal } = useModalStore();
  return (
    <button
      onClick={() => {
        if (confirmationText) {
          openModal({
            type: 'confirmation',
            confirmation: confirmationText,
            onConfirm: onClilck,
          });
        } else {
          onClilck();
        }
      }}
      disabled={disabled}
      className={`rounded-lg px-3 py-1 text-xs font-semibold transition btn-glass ${
        classNames
          ? `${classNames.join(' ')} border opacity-100`
          : 'opacity-70 hover:opacity-100'
      }`}
    >
      {text}
    </button>
  );
};

export default TeamActions;
