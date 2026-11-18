import React, { useMemo, useState } from 'react';
import { LocateFixed, MapPin, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { KARACHI_AREAS } from '../data/karachiAreas';
import { KarachiArea } from '../types';
import { findNearestKarachiArea } from '../utils/deliveryPricing';

interface LocationModalProps {
  open: boolean;
  selectedArea: KarachiArea | null;
  onSelectArea: (area: KarachiArea, customCoords?: { lat: number; lng: number } | null) => void;
  onClose: () => void;
}

const ZONE_FILTERS = [
  'All',
  'North Nazimabad',
  'North Karachi',
  'Central',
  'East',
  'South',
  'DHA',
  'West',
  'Korangi',
  'Malir',
] as const;

export const LocationModal: React.FC<LocationModalProps> = ({
  open,
  selectedArea,
  onSelectArea,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [activeZone, setActiveZone] = useState<string>('All');
  const [detecting, setDetecting] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const filteredAreas = useMemo(() => {
    const q = search.trim().toLowerCase();
    return KARACHI_AREAS.filter((a) => {
      const zoneMatch = activeZone === 'All' || a.zone === activeZone;
      if (!zoneMatch) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) || a.zone.toLowerCase().includes(q)
      );
    });
  }, [search, activeZone]);

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please pick your area below.');
      return;
    }
    setDetecting(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        const nearest = findNearestKarachiArea(coords.lat, coords.lng, KARACHI_AREAS);
        setDetecting(false);
        onSelectArea(nearest, coords);
        onClose();
      },
      () => {
        setDetecting(false);
        setGeoError('Location permission denied or unavailable. Select your Karachi area manually below.');
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-[#1a070b] border border-red-200 dark:border-red-900/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-4 sm:p-5 border-b border-red-100 dark:border-red-900/40 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-stone-900 dark:text-white">
                  Select Your Karachi Area
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  Delivering across Karachi from Plot SF-9, Block E, North Nazimabad
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close location modal"
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-red-50 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
              {/* Auto-detect GPS */}
              <button
                type="button"
                onClick={handleAutoDetect}
                disabled={detecting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-red-900/20 disabled:opacity-60 transition-all cursor-pointer"
              >
                <LocateFixed className={`w-4 h-4 ${detecting ? 'animate-spin' : ''}`} />
                <span>
                  {detecting ? 'Detecting Current Location...' : 'Auto-Detect My Location'}
                </span>
              </button>

              {geoError && (
                <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl px-3 py-2">
                  {geoError}
                </p>
              )}

              {/* Searchable Karachi Areas Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search area or block (e.g. Block H, Clifton, Gulshan)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-rose-50/70 dark:bg-black/40 border border-red-200 dark:border-red-900/50 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Zone Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {ZONE_FILTERS.map((zone) => {
                  const active = activeZone === zone;
                  return (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => setActiveZone(zone)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        active
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-rose-50 dark:bg-white/5 text-stone-600 dark:text-stone-300 border border-red-200/70 dark:border-red-900/40 hover:border-red-500'
                      }`}
                    >
                      {zone}
                    </button>
                  );
                })}
              </div>

              {/* Full Unwrapped Karachi Areas List */}
              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                {filteredAreas.length === 0 ? (
                  <p className="text-xs text-center text-stone-500 py-6">
                    No matching Karachi area found.
                  </p>
                ) : (
                  filteredAreas.map((area) => {
                    const isSelected = selectedArea?.id === area.id;
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => {
                          onSelectArea(area, null);
                          onClose();
                        }}
                        className={`w-full flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-rose-50/70 dark:bg-white/5 text-stone-800 dark:text-stone-100 hover:bg-red-100/80 dark:hover:bg-red-950/50'
                        }`}
                      >
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5 opacity-85" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold leading-snug break-words">
                            {area.name}
                          </p>
                          <p
                            className={`text-[11px] mt-0.5 ${
                              isSelected
                                ? 'text-rose-100'
                                : 'text-stone-500 dark:text-stone-400'
                            }`}
                          >
                            {area.zone} · Karachi
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
