import React from 'react';
import { Flame, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface PromoBannerProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectDeals: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
  visible,
  onDismiss,
  onSelectDeals,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden bg-gradient-to-r from-red-800 via-red-700 to-rose-800 dark:from-red-950 dark:via-red-900 dark:to-rose-950 text-white border-b border-red-600/40"
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2 text-xs sm:text-sm">
            <button
              type="button"
              onClick={onSelectDeals}
              className="flex items-center gap-2 text-left min-w-0 hover:opacity-90 transition-opacity"
            >
              <Flame className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate font-medium">
                Rooftop Special: King BBQ Platter Rs. 4,400 &amp; Family BBQ Platter Rs. 5,499 — Open 5:30 PM to 3:00 AM
              </span>
            </button>

            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss promotional banner"
              className="p-1 rounded-lg hover:bg-white/15 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
