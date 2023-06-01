import { TiktokChat } from "@/app/types";

// NOTE:
// In a larger project this would be in a store like Redis.
// As written, only one server instance is supported.

// One message per creator account can be pinned.
export const PinnedChats: Record<string, TiktokChat | null> = {};

export function setPinnedForCreator(creatorId: string, chat: TiktokChat | null): void {
  PinnedChats[creatorId] = chat;
}
export function getPinnedForCreator(creatorId: string): TiktokChat | null {
  return PinnedChats[creatorId] ?? null;
}