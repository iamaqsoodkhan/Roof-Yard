import React, { useEffect, useState } from 'react';
import { Clock, Send, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { playNotificationPop } from '../utils/sound';

interface FloatingWhatsAppProps {
  autoExpandOnMount?: boolean;
}

const WHATSAPP_NUMBER = '923196639273';

const QUERY_TEMPLATES = [
  {
    label: 'How to track my order',
    message: 'Hello Roof Yard! How can I track my current order status?',
  },
  {
    label: 'Check delivery time for my area',
    message: 'Hello Roof Yard! Can you confirm estimated delivery time for my Karachi area?',
  },
  {
    label: 'Book a rooftop table tonight',
    message: 'Hello Roof Yard! I would like to reserve a rooftop table for tonight.',
  },
  {
    label: 'Ask about BBQ & Platter combos',
    message: 'Hello Roof Yard! Please share details about your King BBQ and Family Platter combos.',
  },
];

function getDynamicWaitTimeByHour(): { waitLabel: string; statusNote: string } {
  const now = new Date();
  const hour = now.getHours();
  const min = now.getMinutes();
  const decimalHour = hour + min / 60;

  if (decimalHour >= 19.5 && decimalHour <= 23.5) {
    return {
      waitLabel: '30–40 mins',
      statusNote: 'Peak rooftop dinner rush',
    };
  }
  if (decimalHour > 23.5 || decimalHour < 3.0) {
    return {
      waitLabel: '20–25 mins',
      statusNote: 'Late-night grill express',
    };
  }
  if (decimalHour >= 17.5 && decimalHour < 19.5) {
    return {
      waitLabel: '15–20 mins',
      statusNote: 'Fresh evening prep',
    };
  }
  return {
    waitLabel: 'Opens 5:30 PM',
    statusNote: 'Pre-orders welcome till 3:00 AM',
  };
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  autoExpandOnMount = true,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mountTooltipVisible, setMountTooltipVisible] = useState(autoExpandOnMount);
  const [showNeedHelp, setShowNeedHelp] = useState(false);

  // Auto-expand wait-time tooltip for 3 seconds on mount
  useEffect(() => {
    if (!autoExpandOnMount) return;
    setMountTooltipVisible(true);
    const t = window.setTimeout(() => {
      setMountTooltipVisible(false);
    }, 3000);
    return () => window.clearTimeout(t);
  }, [autoExpandOnMount]);

  // Show temporary slide-in "Need help?" greeting 3 seconds after load with pop sound
  useEffect(() => {
    const showTimer = window.setTimeout(() => {
      setShowNeedHelp(true);
      playNotificationPop();
    }, 3000);

    const hideTimer = window.setTimeout(() => {
      setShowNeedHelp(false);
    }, 9000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  const waitInfo = getDynamicWaitTimeByHour();
  const showWaitTooltip = !menuOpen && (hovered || mountTooltipVisible);
  const isPulsing = showNeedHelp && !menuOpen;

  const openWhatsApp = (text: string) => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setMenuOpen(false);
  };

  return (
    <div className="fixed left-3.5 bottom-3.5 sm:left-6 sm:bottom-6 z-40 flex flex-col items-start gap-2.5">
      {/* Glassmorphism Predefined Query Template Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}
            className="w-72 sm:w-80 rounded-2xl bg-white/85 dark:bg-[#19070b]/85 border border-red-200/80 dark:border-red-800/60 shadow-2xl p-3.5 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-red-200/60 dark:border-red-900/50">
              <div>
                <p className="font-display text-sm font-bold text-stone-900 dark:text-white">
                  Roof Yard WhatsApp
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Wait Time: {waitInfo.waitLabel}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close WhatsApp templates"
                className="p-1 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              {QUERY_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => openWhatsApp(tpl.message)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-rose-50/80 dark:bg-white/10 hover:bg-[#25D366] hover:text-white text-left text-xs font-medium text-stone-800 dark:text-stone-100 transition-colors cursor-pointer"
                >
                  <span>{tpl.label}</span>
                  <Send className="w-3.5 h-3.5 shrink-0 opacity-75" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Wait Time Tooltip (Hover & 3s Auto-Expand on Mount) */}
      <AnimatePresence>
        {showWaitTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="px-3.5 py-2 rounded-xl bg-white/95 dark:bg-[#1e080d]/95 backdrop-blur-md border border-red-200 dark:border-red-800/60 shadow-lg text-xs"
          >
            <p className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span>Wait Time: {waitInfo.waitLabel}</span>
            </p>
            <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
              {waitInfo.statusNote}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Authentic WhatsApp Floating Icon + Gentle Pulse When "Need help?" Visible */}
      <div
        className="flex items-center gap-2.5"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative flex items-center justify-center">
          {isPulsing && (
            <motion.span
              aria-hidden="true"
              initial={{ scale: 1, opacity: 0.65 }}
              animate={{ scale: [1, 1.42], opacity: [0.65, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full bg-[#25D366]"
            />
          )}

          <motion.button
            type="button"
            onClick={() => {
              setShowNeedHelp(false);
              setMenuOpen((v) => !v);
            }}
            animate={
              isPulsing
                ? { scale: [1, 1.08, 1] }
                : { scale: 1 }
            }
            transition={
              isPulsing
                ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.2 }
            }
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Contact Roof Yard on WhatsApp"
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white shadow-xl shadow-emerald-950/30 flex items-center justify-center cursor-pointer"
          >
            {/* Official WhatsApp Phone-in-Speech-Bubble SVG */}
            <svg
              viewBox="0 0 32 32"
              className="w-7 h-7 sm:w-8 sm:h-8 fill-current"
              aria-hidden="true"
            >
              <path d="M16.01 2.002c-7.72 0-14 6.28-14 14 0 2.47.65 4.88 1.88 7.01L2 30l7.15-1.87A13.92 13.92 0 0 0 16.01 30c7.72 0 14-6.28 14-14s-6.28-13.998-14-13.998zm0 25.63c-2.19 0-4.33-.59-6.2-1.7l-.44-.26-4.24 1.11 1.13-4.13-.29-.46a11.58 11.58 0 0 1-1.78-6.19c0-6.41 5.21-11.62 11.62-11.62 6.41 0 11.62 5.21 11.62 11.62 0 6.41-5.21 11.63-11.62 11.63zm6.38-8.71c-.35-.17-2.06-1.02-2.38-1.13-.32-.12-.55-.17-.78.17-.23.35-.9 1.13-1.1 1.37-.2.23-.41.26-.76.09-.35-.18-1.48-.54-2.81-1.74-1.04-.93-1.74-2.07-1.94-2.42-.2-.35-.02-.54.15-.71.16-.16.35-.41.52-.61.18-.2.23-.35.35-.58.12-.23.06-.44-.03-.61-.09-.17-.78-1.89-1.07-2.59-.28-.68-.57-.58-.78-.6h-.66c-.23 0-.61.09-.93.44-.32.35-1.22 1.19-1.22 2.9 0 1.71 1.25 3.37 1.42 3.6.17.23 2.46 3.76 5.96 5.27.83.36 1.48.57 1.99.73.84.27 1.6.23 2.2.14.67-.1 2.06-.84 2.35-1.66.29-.81.29-1.51.2-1.66-.09-.15-.32-.23-.67-.41z" />
            </svg>
          </motion.button>
        </div>

        <AnimatePresence>
          {showNeedHelp && !menuOpen && (
            <motion.button
              type="button"
              onClick={() => {
                setShowNeedHelp(false);
                setMenuOpen(true);
              }}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="px-3.5 py-2 rounded-xl bg-white/95 dark:bg-[#1e080d]/95 backdrop-blur-md border border-emerald-300/70 dark:border-emerald-700/60 shadow-lg text-xs font-semibold text-stone-900 dark:text-white whitespace-nowrap cursor-pointer"
            >
              Need help?
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
