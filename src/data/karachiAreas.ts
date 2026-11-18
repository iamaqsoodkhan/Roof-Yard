import { KarachiArea } from '../types';

export const KARACHI_AREAS: KarachiArea[] = [
  // North Nazimabad & Immediate Neighborhoods
  { id: 'nn-block-e', name: 'North Nazimabad Block E (Near Roof Yard)', zone: 'North Nazimabad', lat: 24.9378, lng: 67.0422 },
  { id: 'nn-block-a', name: 'North Nazimabad Block A', zone: 'North Nazimabad', lat: 24.9261, lng: 67.0326 },
  { id: 'nn-block-b', name: 'North Nazimabad Block B', zone: 'North Nazimabad', lat: 24.9299, lng: 67.0384 },
  { id: 'nn-block-c', name: 'North Nazimabad Block C', zone: 'North Nazimabad', lat: 24.9332, lng: 67.0398 },
  { id: 'nn-block-d', name: 'North Nazimabad Block D', zone: 'North Nazimabad', lat: 24.9365, lng: 67.0445 },
  { id: 'nn-block-f', name: 'North Nazimabad Block F', zone: 'North Nazimabad', lat: 24.9412, lng: 67.0468 },
  { id: 'nn-block-g', name: 'North Nazimabad Block G', zone: 'North Nazimabad', lat: 24.9438, lng: 67.0491 },
  { id: 'nn-block-h', name: 'North Nazimabad Block H (Five Star)', zone: 'North Nazimabad', lat: 24.9455, lng: 67.0449 },
  { id: 'nn-block-i', name: 'North Nazimabad Block I', zone: 'North Nazimabad', lat: 24.9482, lng: 67.0481 },
  { id: 'nn-block-j', name: 'North Nazimabad Block J', zone: 'North Nazimabad', lat: 24.9498, lng: 67.0525 },
  { id: 'nn-block-k', name: 'North Nazimabad Block K', zone: 'North Nazimabad', lat: 24.9531, lng: 67.0454 },
  { id: 'nn-block-l', name: 'North Nazimabad Block L (Hyderi)', zone: 'North Nazimabad', lat: 24.9401, lng: 67.0489 },
  { id: 'nn-block-m', name: 'North Nazimabad Block M', zone: 'North Nazimabad', lat: 24.9447, lng: 67.0381 },
  { id: 'nn-block-n', name: 'North Nazimabad Block N (Sakhi Hassan)', zone: 'North Nazimabad', lat: 24.9571, lng: 67.0504 },
  { id: 'nn-block-p', name: 'North Nazimabad Block P', zone: 'North Nazimabad', lat: 24.9598, lng: 67.0439 },
  { id: 'nn-block-q', name: 'North Nazimabad Block Q', zone: 'North Nazimabad', lat: 24.9628, lng: 67.0472 },
  { id: 'nn-block-s', name: 'North Nazimabad Block S', zone: 'North Nazimabad', lat: 24.9642, lng: 67.0531 },
  { id: 'nn-block-t', name: 'North Nazimabad Block T', zone: 'North Nazimabad', lat: 24.9665, lng: 67.0568 },
  { id: 'shadman-town', name: 'Shadman Town', zone: 'North Karachi', lat: 24.9653, lng: 67.0592 },
  { id: 'buffer-zone', name: 'Buffer Zone (15-A / 15-B)', zone: 'North Karachi', lat: 24.9595, lng: 67.0645 },
  { id: 'north-karachi', name: 'North Karachi (Sectors 5–11)', zone: 'North Karachi', lat: 24.9825, lng: 67.0641 },
  { id: 'new-karachi', name: 'New Karachi', zone: 'North Karachi', lat: 24.9961, lng: 67.0695 },
  { id: 'surjani-town', name: 'Surjani Town', zone: 'North Karachi', lat: 25.0252, lng: 67.0652 },

  // Central Karachi
  { id: 'nazimabad', name: 'Nazimabad (1 to 4)', zone: 'Central', lat: 24.9165, lng: 67.0315 },
  { id: 'paposh-nagar', name: 'Paposh Nagar', zone: 'Central', lat: 24.9225, lng: 67.0221 },
  { id: 'fb-area', name: 'Federal B Area (Blocks 1–21)', zone: 'Central', lat: 24.9334, lng: 67.0715 },
  { id: 'karimabad', name: 'Karimabad', zone: 'Central', lat: 24.9168, lng: 67.0562 },
  { id: 'liaquatabad', name: 'Liaquatabad', zone: 'Central', lat: 24.9061, lng: 67.0485 },
  { id: 'gulberg', name: 'Gulberg Town', zone: 'Central', lat: 24.9481, lng: 67.0785 },
  { id: 'ancholi', name: 'Ancholi', zone: 'Central', lat: 24.9455, lng: 67.0861 },

  // East Karachi
  { id: 'gulshan-iqbal', name: 'Gulshan-e-Iqbal (Blocks 1–13D)', zone: 'East', lat: 24.9204, lng: 67.0944 },
  { id: 'gulistan-johar', name: 'Gulistan-e-Johar (Blocks 1–20)', zone: 'East', lat: 24.9181, lng: 67.1292 },
  { id: 'scheme-33', name: 'Scheme 33 / Saadi Town', zone: 'East', lat: 24.9562, lng: 67.1525 },
  { id: 'bahadurabad', name: 'Bahadurabad', zone: 'East', lat: 24.8825, lng: 67.0691 },
  { id: 'pechs', name: 'PECHS (Blocks 2–6)', zone: 'East', lat: 24.8722, lng: 67.0615 },
  { id: 'tariq-road', name: 'Tariq Road', zone: 'East', lat: 24.8712, lng: 67.0598 },
  { id: 'karsaz', name: 'Karsaz / Nursery', zone: 'East', lat: 24.8768, lng: 67.0891 },
  { id: 'shahrah-faisal', name: 'Shahrah-e-Faisal', zone: 'East', lat: 24.8648, lng: 67.0734 },
  { id: 'gulshan-maymar', name: 'Gulshan-e-Maymar', zone: 'Gadap', lat: 25.0165, lng: 67.1281 },

  // South & Old City
  { id: 'garden-east-west', name: 'Garden East & West', zone: 'South', lat: 24.8758, lng: 67.0285 },
  { id: 'soldier-bazaar', name: 'Soldier Bazaar', zone: 'South', lat: 24.8772, lng: 67.0391 },
  { id: 'saddar', name: 'Saddar / Empress Market', zone: 'South', lat: 24.8607, lng: 67.0258 },
  { id: 'clifton', name: 'Clifton (Blocks 1–9)', zone: 'South', lat: 24.8138, lng: 67.0299 },
  { id: 'dha-phase-1-4', name: 'DHA Phase 1 – 4', zone: 'DHA', lat: 24.8285, lng: 67.0648 },
  { id: 'dha-phase-5-6', name: 'DHA Phase 5 & 6', zone: 'DHA', lat: 24.7985, lng: 67.0621 },
  { id: 'dha-phase-7-8', name: 'DHA Phase 7 & 8', zone: 'DHA', lat: 24.7824, lng: 67.0882 },
  { id: 'defence-view', name: 'Defence View / Qayyumabad', zone: 'South', lat: 24.8435, lng: 67.0791 },
  { id: 'lyari', name: 'Lyari / Kharadar', zone: 'South', lat: 24.8662, lng: 66.9961 },

  // West & Korangi / Malir
  { id: 'orangi-town', name: 'Orangi Town', zone: 'West', lat: 24.9482, lng: 66.9922 },
  { id: 'site-area', name: 'SITE Industrial Area', zone: 'West', lat: 24.9045, lng: 66.9998 },
  { id: 'baldia-town', name: 'Baldia Town', zone: 'West', lat: 24.9185, lng: 66.9588 },
  { id: 'korangi', name: 'Korangi / Landhi', zone: 'Korangi', lat: 24.8385, lng: 67.1361 },
  { id: 'shah-faisal-colony', name: 'Shah Faisal Colony', zone: 'Korangi', lat: 24.8775, lng: 67.1522 },
  { id: 'malir-cantt', name: 'Malir Cantt / Model Colony', zone: 'Malir', lat: 24.9102, lng: 67.2024 },
];
