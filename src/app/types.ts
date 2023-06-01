
export interface BasicMeter {
  id: string;
  keyword: string;
  color: string;
  count: number;
  goal: number;
  header?: string;
}

export interface TiktokChat {
  profilePictureUrl: any;
  uniqueId: string;
  comment: string;
}