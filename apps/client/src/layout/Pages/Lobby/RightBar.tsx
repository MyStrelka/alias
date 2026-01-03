import PlayerTable from '../../../components/PlayerTable';
import Tile from '../../../components/Tile';
import { useGameStore } from '../../../store/games/alilasStore';
import { useRootStore } from '../../../store/rootStore';

const LobbyRightBar = () => {
  const { deviceId } = useRootStore();
  const { players, isHost, actions } = useGameStore();

  return (
    <Tile
      title='Список игроков'
      rightElement={
        <div className='text-xs font-mono bg-white/10 px-2 py-1 rounded'>
          {players.length} / 8
        </div>
      }
    >
      <PlayerTable
        players={players}
        selfId={deviceId}
        isHost={isHost}
        onToggleReady={actions.toggleReady}
        onKick={actions.kickPlayer}
        gameStage='lobby'
      />
    </Tile>
  );
};

export default LobbyRightBar;
