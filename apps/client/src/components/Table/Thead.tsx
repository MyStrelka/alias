const Thead = ({ text, align }: { text: string; align?: 'left' | 'right' }) => (
  <th className={`px-4 py-3 text-${align || 'left'}`}>{text}</th>
);

export default Thead;
