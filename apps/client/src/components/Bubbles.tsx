const Bubbles = () => (
  <div className='fixed inset-0  overflow-hidden pointer-events-none'>
    <div className='absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-blob' />
    <div className='absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-main/20 rounded-full blur-[100px] animate-blob animation-delay-2000' />
  </div>
);

export default Bubbles;
