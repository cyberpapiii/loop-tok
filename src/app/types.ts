
export interface BasicMeter {
  id: string;
  keyword: string;
  color: string;
  count: number;
  goal: number;
  header?: string;
}

export interface TiktokChat {
  profilePictureUrl: string;
  uniqueId: string;
  comment: string;
}