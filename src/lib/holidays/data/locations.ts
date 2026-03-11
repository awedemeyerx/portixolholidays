import type { Localized } from '../types';

export type LocationGroupConfig = {
  slug: string;
  priority: number;
  title: Localized;
  beds24PropertyIds: number[];
};

export const defaultLocationGroups: LocationGroupConfig[] = [
  {
    slug: 'portixol-el-molinar',
    priority: 1,
    title: {
      de: 'Portixol / El Molinar, Palma',
      en: 'Portixol / El Molinar, Palma',
      es: 'Portixol / El Molinar, Palma',
    },
    beds24PropertyIds: [174132, 174133, 190433, 244683, 244684],
  },
  {
    slug: 'port-d-andratx',
    priority: 2,
    title: {
      de: "Port d'Andratx",
      en: "Port d'Andratx",
      es: "Port d'Andratx",
    },
    beds24PropertyIds: [266083, 266085],
  },
];
