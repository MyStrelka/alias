const Avatar = ({
  avatar,
  size,
  placeholder,
}: {
  avatar: string | null;
  size: number;
  placeholder: React.ReactNode;
}) => {
  return avatar ? (
    <img
      src={avatar}
      width={size}
      height={size}
      style={{ borderRadius: '50%' }}
    />
  ) : (
    (placeholder ?? null)
  );
};

export default Avatar;
