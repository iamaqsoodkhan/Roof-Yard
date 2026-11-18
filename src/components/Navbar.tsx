import React from 'react';
import { MapPin, Moon, ShoppingBag, Sun, User } from 'lucide-react';
import { motion } from 'motion/react';
import { KarachiArea, ThemeMode, UserProfile } from '../types';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  selectedArea: KarachiArea | null;
  onOpenLocation: () => void;
  cartCount: number;
  onOpenCart: () => void;
  cartButtonRef: React.RefObject<HTMLButtonElement | null>;
  cartPulse: boolean;
  user: UserProfile | null;
  onOpenAuthOrDashboard: () => void;
  onScrollToCategory: (cat: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  selectedArea,
  onOpenLocation,
  cartCount,
  onOpenCart,
  cartButtonRef,
  cartPulse,
  user,
  onOpenAuthOrDashboard,
  onScrollToCategory,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-rose-50/85 dark:bg-[#120407]/85 border-b border-red-200/70 dark:border-red-900/40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
        {/* Zone 1: Brand Logo */}
        <a
          href="#top"
          className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg"
        >
          <img
            src={theme === 'dark' ? '/images/logo-dark.webp' : '/images/logo-light.webp'}
            alt="Roof Yard — De Cafe & Grill"
            className="h-9 sm:h-11 w-auto object-contain"
          />
          <span className="hidden sm:inline-block font-display font-bold text-base tracking-tight text-stone-900 dark:text-white whitespace-nowrap">
            Roof Yard
          </span>
        </a>

        {/* Zone 2: Clean Desktop Navigation Links (No Hamburger on Mobile) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-700 dark:text-stone-300">
          <button
            type="button"
            onClick={() => onScrollToCategory('All')}
            className="hover:text-red-700 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Full Menu
          </button>
          <button
            type="button"
            onClick={() => onScrollToCategory('Burgers')}
            className="hover:text-red-700 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Burgers
          </button>
          <button
            type="button"
            onClick={() => onScrollToCategory('BBQ & Platters')}
            className="hover:text-red-700 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            BBQ &amp; Platters
          </button>
          <button
            type="button"
            onClick={() => onScrollToCategory('Karahi & Handi')}
            className="hover:text-red-700 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Karahi &amp; Handi
          </button>
          <button
            type="button"
            onClick={() => onScrollToCategory('Kunafa & Desserts')}
            className="hover:text-red-700 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Kunafa
          </button>
        </nav>

        {/* Zone 3: Responsive Action Bar (Zero Overflow on 375px Mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Location Trigger */}
          <button
            type="button"
            onClick={onOpenLocation}
            title={selectedArea ? selectedArea.name : 'Select Karachi Area'}
            className="flex items-center gap-1.5 h-9 sm:h-10 px-2 sm:px-3 rounded-xl bg-white/80 dark:bg-white/5 border border-red-200 dark:border-red-900/50 text-stone-800 dark:text-stone-100 hover:border-red-500 transition-colors text-[11px] sm:text-sm font-medium max-w-[118px] sm:max-w-[195px] cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
            <span className="truncate">
              {selectedArea
                ? selectedArea.name
                    .split('(')[0]
                    .trim()
                    .replace(/^North Nazimabad Block /i, 'NN Blk ')
                : 'Karachi'}
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-white/80 dark:bg-white/5 border border-red-200 dark:border-red-900/50 text-stone-800 dark:text-amber-300 hover:border-red-500 transition-colors shrink-0 cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-red-700" />}
          </button>

          {/* Google Account / Dashboard Button */}
          <button
            type="button"
            onClick={onOpenAuthOrDashboard}
            aria-label={user ? 'Customer Dashboard' : 'Sign in with Google'}
            className="flex items-center gap-1.5 h-9 sm:h-10 px-2 sm:px-3 rounded-xl bg-white/80 dark:bg-white/5 border border-red-200 dark:border-red-900/50 text-stone-800 dark:text-stone-100 hover:border-red-500 transition-colors text-xs sm:text-sm font-medium shrink-0 cursor-pointer"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover shrink-0"
              />
            ) : user ? (
              <User className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
              </svg>
            )}
            <span className="hidden md:inline whitespace-nowrap">
              {user ? user.displayName.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          {/* Sticky Cart Button */}
          <motion.button
            ref={cartButtonRef}
            type="button"
            onClick={onOpenCart}
            animate={cartPulse ? { scale: [1, 1.16, 1] } : { scale: 1 }}
            transition={{ duration: 0.35 }}
            aria-label={`Open cart with ${cartCount} items`}
            className="flex items-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-md shadow-red-900/20 text-xs sm:text-sm font-semibold shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="tabular-nums whitespace-nowrap">{cartCount}</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
