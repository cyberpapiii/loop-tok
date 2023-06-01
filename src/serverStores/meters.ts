// NOTE:
// In a larger project this would be in a store like Redis.
// As written, only one server instance is supported.
import { randomId } from "./utils";

interface Meter {
  id: string;
  creatorId: string;
  keyword: string;
  goal: number;
  color: string;
  count: number;
  header: string | null;
}

export const Meters: Meter[] = [];

export function createMeter(
  creatorId: string,
  keyword: string,
  goal: number,
  color: string,
  header: string | null = null
) {
  return Meters.push({
    id: randomId(),
    creatorId,
    keyword,
    goal,
    color,
    header,
    count: 0
  });
}

export function getForCreator(creatorId: string): Meter[] {
  return Meters.filter((meter) => meter.creatorId === creatorId);
}

export function getMeter(id: string): Meter | null {
  return Meters.find((meter) => meter.id === id) ?? null;
}

export function removeMeter(id: string): Meter | null {
  const idx = Meters.findIndex((meter) => meter.id === id);
  const removed = Meters.splice(idx, 1);
  return removed[0];
}

export function processChat(creatorId: string, message: string) {
  const updatedMeters = [];

  for (let meter of Meters) {
    if (meter.creatorId === creatorId && message.match(meter.keyword)) {
      meter.count = meter.count + 1;
      updatedMeters.push(meter);
    }
  }

  return updatedMeters;
}