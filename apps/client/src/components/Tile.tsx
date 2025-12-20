const Tile = ({ title, children, rightElement }: any) => (
  <div className='glass-panel p-4 md:p-5'>
    <div className='flex items-center justify-between mb-4'>
      <h3 className='text-lg font-semibold text-white'>{title}</h3>
      {rightElement}
    </div>
    {children}
  </div>
);

export default Tile;
