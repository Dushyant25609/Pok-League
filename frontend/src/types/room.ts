export interface CreateRoomRequest {
  username: string;
  generation_allowed: number[];
  banned_types: string[];
  allow_legendaries: boolean;
  allow_mythicals: boolean;
  team_selection_time: number;
}

export interface JoinRoomRequest {
  room_id: string;
  username: string;
}
