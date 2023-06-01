import { BasicMeter } from '@/app/types';
import { create } from 'zustand'

type MetersStore = {
  meters: BasicMeter[],
  watchedMeters: Record<string, BasicMeter>,
  updateMeter: (meter: BasicMeter) => void;
  setMeters: (meter: BasicMeter[]) => void;
}

export const useMetersStore = create<MetersStore>((set) => ({
  meters: [],
  watchedMeters: {},
  updateMeter: (meter: BasicMeter) => set((state: {watchedMeters: Record<string, any>}) => {
    const newMeters = Object.assign({}, state.watchedMeters);
    newMeters[meter.id] = meter;

    return {
      watchedMeters: newMeters
    }
  }),
  setMeters: (meters: BasicMeter[]) => set((state: {meters: any[]}) => ({
    meters: [
      ...meters
    ]
  })),
}))