const Td = ({
  children,
  classNames,
  ...otherProps
}: {
  classNames?: string[];
  children: React.ReactNode;
  [x: string]: any;
}) => (
  <td
    className={`px-4 py-3 ${classNames ? classNames.join(' ') : ''}`}
    {...otherProps}
  >
    {children}
  </td>
);

export default Td;
