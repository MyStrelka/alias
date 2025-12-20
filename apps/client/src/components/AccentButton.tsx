const AccentButton = ({ onClick, children, disabled, className = '' }: any) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`btn-glass btn-accent flex items-center justify-center gap-2 ${className}`}
  >
    {children}
  </button>
);

export default AccentButton;
