const Td = ({
  children,
  classNames,
}: {
  classNames: string[];
  children: React.ReactNode;
}) => <td className={`px-4 py-3 ${classNames.join(' ')}`}>{children}</td>;

export default Td;
