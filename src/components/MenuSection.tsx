import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CakeSlice,
  Check,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Croissant,
  CupSoda,
  Drumstick,
  Flame,
  LayoutGrid,
  Mic,
  MicOff,
  Minus,
  Plus,
  Sandwich,
  Search,
  ShoppingBag,
  Soup,
  Sparkles,
  UtensilsCrossed,
  Wheat,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { MENU_CATEGORIES, MENU_ITEMS } from '../data/menuData';
import { CartItem, MenuItem } from '../types';
import { formatPKR } from '../utils/deliveryPricing';
import { LazyWebpImage } from './LazyWebpImage';

interface MenuSectionProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  cart: CartItem[];
  onAddToCart: (
    item: MenuItem,
    variantLabel?: string,
    addonLabel?: string,
    unitPrice?: number,
    imgRect?: DOMRect,
  ) => void;
  onUpdateQty: (cartKey: string, delta: number) => void;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

function renderCategoryIcon(category: string) {
  const cls = 'w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0';
  switch (category) {
    case 'All':
      return <LayoutGrid className={cls} />;
    case 'Burgers':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cls}
          aria-hidden="true"
        >
          <path d="M5 11a7 7 0 0 1 14 0H5Z" />
          <path d="M4 14h16" />
          <path d="M5 17h14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" />
        </svg>
      );
    case 'BBQ & Platters':
      return <Flame className={cls} />;
    case 'Karahi & Handi':
      return <ChefHat className={cls} />;
    case 'Pasta & Parmesan':
      return <UtensilsCrossed className={cls} />;
    case 'Chinese & Rice':
      return <Soup className={cls} />;
    case 'Broast':
      return <Drumstick className={cls} />;
    case 'Starters & Dips':
      return <Sparkles className={cls} />;
    case 'Rolls & Paratha':
      return <Croissant className={cls} />;
    case 'Sandwiches':
      return <Sandwich className={cls} />;
    case 'Tandoor':
      return <Wheat className={cls} />;
    case 'Kunafa & Desserts':
      return <CakeSlice className={cls} />;
    case 'Shakes & Slush':
      return <CupSoda className={cls} />;
    case 'Chai & Drinks':
      return <Coffee className={cls} />;
    default:
      return <LayoutGrid className={cls} />;
  }
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  activeCategory,
  onSelectCategory,
  cart,
  onAddToCart,
  onUpdateQty,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const { selectedItems, remainingItems, totalVisibleCount } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = (item: MenuItem) => {
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false)
      );
    };

    if (activeCategory === 'All') {
      const all = MENU_ITEMS.filter(matchesSearch);
      return {
        selectedItems: all,
        remainingItems: [] as MenuItem[],
        totalVisibleCount: all.length,
      };
    }

    const selected = MENU_ITEMS.filter(
      (item) => item.category === activeCategory && matchesSearch(item),
    );
    const remaining = MENU_ITEMS.filter(
      (item) => item.category !== activeCategory && matchesSearch(item),
    );

    return {
      selectedItems: selected,
      remainingItems: remaining,
      totalVisibleCount: selected.length + remaining.length,
    };
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    const btn = tabRefs.current[activeCategory];
    if (btn) {
      btn.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeCategory]);

  const handleCategoryClick = (category: string) => {
    onSelectCategory(category);
  };

  const scrollRail = (direction: 'left' | 'right') => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction === 'left' ? -240 : 240,
      behavior: 'smooth',
    });
  };

  const handleVoiceSearch = () => {
    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceNotice('Voice search is not supported in this browser.');
      window.setTimeout(() => setVoiceNotice(null), 3000);
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = 'en-PK';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    setVoiceNotice(null);

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript) {
        setSearchQuery(transcript.trim());
        onSelectCategory('All');
      }
      setListening(false);
    };
    recognition.onerror = () => {
      setListening(false);
      setVoiceNotice('Could not capture voice. Please try again.');
      window.setTimeout(() => setVoiceNotice(null), 2500);
    };
    recognition.onend = () => {
      setListening(false);
    };
    recognition.start();
  };

  return (
    <section
      id="menu-section"
      className="max-w-7xl mx-auto px-3 sm:px-6 py-7 sm:py-11"
    >
      {/* Top Row: Search Bar (Left) + Active Category Title & Count (Right) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="w-full sm:max-w-md">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search burgers, karahi, rolls, BBQ..."
              aria-label="Search menu items"
              className="w-full pl-10 pr-20 py-2.5 rounded-full bg-white/95 dark:bg-[#1b080c]/95 border border-red-200 dark:border-red-900/50 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleVoiceSearch}
                aria-label="Voice search menu"
                title="Voice search"
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  listening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-white/10'
                }`}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {voiceNotice && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 pl-2">{voiceNotice}</p>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 px-1">
          <h2 className="font-display text-base sm:text-lg font-bold text-stone-900 dark:text-white">
            {activeCategory === 'All' ? 'All Menu Items' : activeCategory}
          </h2>
          <span className="text-xs sm:text-sm font-semibold tabular-nums text-stone-500 dark:text-stone-400">
            ({selectedItems.length})
          </span>
        </div>
      </div>

      {/* Interactive Category Rail with Left / Right Scroll Arrow Buttons & Animated Sliding Highlight */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 mb-6">
        <button
          type="button"
          onClick={() => scrollRail('left')}
          aria-label="Scroll categories left"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/95 dark:bg-[#1b080c]/95 border border-red-200 dark:border-red-900/50 text-stone-700 dark:text-stone-200 hover:border-red-500 flex items-center justify-center shrink-0 shadow-sm transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={railRef}
          className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 scroll-smooth"
        >
          {MENU_CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                ref={(el) => {
                  tabRefs.current[category] = el;
                }}
                type="button"
                onClick={() => handleCategoryClick(category)}
                className={`relative px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-white'
                    : 'bg-white/90 dark:bg-[#1b080c]/90 text-stone-700 dark:text-stone-300 border border-red-200/80 dark:border-red-900/45 hover:border-red-500'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeCategoryHighlight"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 shadow-md shadow-red-900/25"
                  />
                )}
                <span className="relative z-10 inline-flex items-center gap-1.5">
                  {renderCategoryIcon(category)}
                  <span>{category}</span>
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scrollRail('right')}
          aria-label="Scroll categories right"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/95 dark:bg-[#1b080c]/95 border border-red-200 dark:border-red-900/50 text-stone-700 dark:text-stone-200 hover:border-red-500 flex items-center justify-center shrink-0 shadow-sm transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Responsive Menu Grid: Selected Items on Top + All Remaining Items Below */}
      <AnimatePresence mode="wait">
        {totalVisibleCount === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-white/70 dark:bg-[#1a070b]/70 p-10 text-center"
          >
            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
              No menu items matched your search.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                onSelectCategory('All');
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold cursor-pointer"
            >
              Show All Items
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-9 sm:space-y-11"
          >
            {/* Primary Selected Items Grid */}
            {selectedItems.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
                {selectedItems.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    cart={cart}
                    onAddToCart={onAddToCart}
                    onUpdateQty={onUpdateQty}
                  />
                ))}
              </div>
            )}

            {/* All Remaining Menu Items Shown Below */}
            {remainingItems.length > 0 && (
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-red-200/80 dark:border-red-900/40">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                      More from Roof Yard
                    </h3>
                    <span className="text-xs sm:text-sm font-semibold tabular-nums text-stone-500 dark:text-stone-400">
                      ({remainingItems.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCategoryClick('All')}
                    className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-400 hover:underline whitespace-nowrap cursor-pointer"
                  >
                    Show All Together
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
                  {remainingItems.map((item) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      cart={cart}
                      onAddToCart={onAddToCart}
                      onUpdateQty={onUpdateQty}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

interface MenuCardProps {
  item: MenuItem;
  cart: CartItem[];
  onAddToCart: (
    item: MenuItem,
    variantLabel?: string,
    addonLabel?: string,
    unitPrice?: number,
    imgRect?: DOMRect,
  ) => void;
  onUpdateQty: (cartKey: string, delta: number) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({
  item,
  cart,
  onAddToCart,
  onUpdateQty,
}) => {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedAddon, setSelectedAddon] = useState(false);
  const imageWrapRef = useRef<HTMLDivElement | null>(null);

  const activeVariant = item.variants?.[selectedVariantIdx];
  const activeAddon = selectedAddon && item.addons?.[0] ? item.addons[0] : undefined;

  const computedPrice =
    (activeVariant ? activeVariant.price : item.price) +
    (activeAddon ? activeAddon.price : 0);

  const cartKey = `${item.id}__${activeVariant?.label || 'std'}__${
    activeAddon?.label || 'none'
  }`;
  const existingCartItem = cart.find((c) => c.cartKey === cartKey);

  const handleAdd = () => {
    const rect = imageWrapRef.current?.getBoundingClientRect();
    onAddToCart(
      item,
      activeVariant?.label,
      activeAddon?.label,
      computedPrice,
      rect,
    );
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.06 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col min-w-0 rounded-2xl overflow-hidden bg-white/95 dark:bg-[#19070b]/95 border border-red-200/80 dark:border-red-900/45 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* 4:3 Lazy WebP Image with Skeleton */}
      <div
        ref={imageWrapRef}
        className="relative aspect-[4/3] w-full overflow-hidden bg-rose-100 dark:bg-black/40"
      >
        <LazyWebpImage
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 min-w-0 p-2.5 sm:p-4">
        <p className="text-[10px] sm:text-[11px] font-medium text-red-700 dark:text-red-400 truncate">
          {item.category}
        </p>

        <h3 className="font-display text-xs sm:text-base font-bold text-stone-900 dark:text-white leading-snug mt-0.5 line-clamp-2">
          {item.name}
        </h3>

        {item.description && (
          <p className="mt-1 text-[11px] sm:text-xs text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Optional Variants */}
        {item.variants && item.variants.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.variants.map((v, idx) => (
              <button
                key={v.label}
                type="button"
                onClick={() => setSelectedVariantIdx(idx)}
                className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  idx === selectedVariantIdx
                    ? 'bg-red-600 text-white'
                    : 'bg-rose-50 dark:bg-white/5 text-stone-700 dark:text-stone-300 border border-red-200/70 dark:border-red-900/40'
                }`}
              >
                {v.label.replace(' Chicken Chargha', '')}
              </button>
            ))}
          </div>
        )}

        {/* Optional Add-on */}
        {item.addons && item.addons.length > 0 && (
          <label className="mt-2 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-stone-700 dark:text-stone-300 cursor-pointer select-none min-w-0">
            <input
              type="checkbox"
              checked={selectedAddon}
              onChange={(e) => setSelectedAddon(e.target.checked)}
              className="rounded border-red-300 text-red-600 focus:ring-red-500 shrink-0"
            />
            <span className="truncate">
              {item.addons[0].label} (+{formatPKR(item.addons[0].price)})
            </span>
          </label>
        )}

        {/* Price + Compact Mobile-Fit Action Footer */}
        <div className="mt-auto pt-2.5 sm:pt-3 flex flex-col gap-2 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="font-display font-bold text-xs sm:text-base text-stone-900 dark:text-white tabular-nums whitespace-nowrap">
              {formatPKR(computedPrice)}
            </span>
          </div>

          {existingCartItem ? (
            <div className="w-full min-w-0 overflow-hidden flex items-center justify-between gap-1 rounded-xl bg-red-600/10 dark:bg-red-500/20 border border-red-500/45 p-1">
              <button
                type="button"
                onClick={() => onUpdateQty(cartKey, -1)}
                aria-label={`Decrease ${item.name} quantity`}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white dark:bg-[#240a0f] text-red-700 dark:text-red-300 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors shrink-0 cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>

              <span className="inline-flex items-center justify-center gap-0.5 text-[10px] sm:text-xs font-bold text-red-700 dark:text-red-300 whitespace-nowrap min-w-0 truncate px-0.5">
                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                <span>Added</span>
                <span className="tabular-nums">({existingCartItem.quantity})</span>
              </span>

              <button
                type="button"
                onClick={() => onUpdateQty(cartKey, 1)}
                aria-label={`Increase ${item.name} quantity`}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="w-full py-2 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-[11px] sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98] whitespace-nowrap cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
};
