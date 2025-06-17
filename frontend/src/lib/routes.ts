export enum Routes {
  Home = '/',
  Pokedex = '/pokedex',
  Performance = '/performance',
  Battle = '/battle',
  CreateRoom = '/battle/room/create',
  JoinRoom = '/battle/room/join',
  SelectionRoom = '/battle/room/selection/:roomId',
  Lobby = '/battle/room/lobby',
}

export enum SocketEvents {
  SelectPokemon = '/team-selection/:roomId',
  Lobby = '/lobby/:roomId',
}
