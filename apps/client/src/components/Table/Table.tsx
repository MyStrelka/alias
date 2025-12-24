const Table = ({ header, rows }: any) => (
  <div className='overflow-hidden rounded-xl border border-white/5 bg-black/10'>
    <table className='min-w-full text-sm text-gray-300'>
      <thead className='bg-white/5 text-xs uppercase tracking-wide text-gray-400'>
        <tr>{header()}</tr>
      </thead>
      <tbody className='divide-y divide-white/5'>{rows()}</tbody>
    </table>
  </div>
);

export default Table;
