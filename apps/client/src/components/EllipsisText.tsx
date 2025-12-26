const EllipsisText = ({
  text,
  classNames,
}: {
  text: string;
  classNames: string;
}) => <span className={`truncate w-full ${classNames}`}>{text}</span>;

export default EllipsisText;
