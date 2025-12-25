const Avatar = ({
  avatar,
  size,
  placeholder,
}: {
  avatar: string;
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
    placeholder
  );
};

export default Avatar;
