import React from 'react';
import { Clock, MapPin, MessageCircle, Phone } from 'lucide-react';
import { ThemeMode } from '../types';

interface FooterProps {
  theme: ThemeMode;
}

export const Footer: React.FC<FooterProps> = ({ theme }) => {
  return (
    <footer className="border-t border-red-200/70 dark:border-red-900/40 bg-white/75 dark:bg-[#120407]/90 backdrop-blur-md mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="space-y-3">
          <img
            src={theme === 'dark' ? '/images/logo-dark.webp' : '/images/logo-light.webp'}
            alt="Roof Yard — De Cafe & Grill"
            className="h-14 w-auto object-contain"
          />
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-xs leading-relaxed">
            Rooftop retreat for foodies in North Nazimabad, Karachi. Enjoy charcoal BBQ, sizzling burgers, karahi, pasta &amp; kunafa under open skies.
          </p>
        </div>

        <div className="space-y-2.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
          <h3 className="font-display font-bold text-stone-900 dark:text-white text-sm">
            Visit Roof Yard
          </h3>
          <a
            href="https://maps.app.goo.gl/VhQ31c1YeHh6Apwq8"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <MapPin className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <span>Plot No. SF-9, Block E, North Nazimabad Town, Karachi, 74550, Pakistan</span>
          </a>
          <p className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>Open Daily · 5:30 PM to 3:00 AM</span>
          </p>
        </div>

        <div className="space-y-2.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
          <h3 className="font-display font-bold text-stone-900 dark:text-white text-sm">
            Order &amp; Reservations
          </h3>
          <a
            href="tel:03196639273"
            className="flex items-center gap-2 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <Phone className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span className="font-mono">0319-6639273</span>
          </a>
          <a
            href="https://wa.me/923196639273"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors mt-1"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Direct</span>
          </a>
        </div>
      </div>

      <div className="border-t border-red-200/50 dark:border-red-900/30 py-4 px-4 text-center text-xs text-stone-500 dark:text-stone-400">
        © {new Date().getFullYear()} Roof Yard — De Cafe &amp; Grill. All rights reserved.
      </div>
    </footer>
  );
};
