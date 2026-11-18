import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, ShoppingBag } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ThemeMode } from '../types';
import { formatPKR } from '../utils/deliveryPricing';
import { LazyWebpImage } from './LazyWebpImage';

interface HeroSliderProps {
  theme: ThemeMode;
  onOrderItem: (itemId: string) => void;
  onExploreMenu: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  theme,
  onOrderItem,
  onExploreMenu,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      id: 'hero-rooftop',
      image: theme === 'dark' ? '/images/hero-dark.webp' : '/images/hero-light.webp',
      kicker: 'North Nazimabad, Karachi · Open 5:30 PM – 3:00 AM',
      title: 'Rooftop Retreat for Foodies',
      subtitle:
        'Charcoal BBQ platters, sizzling smash burgers, creamy matka pasta, and golden Arabic kunafa served under open skies.',
      ctaLabel: 'Explore Full Menu',
      itemId: null as string | null,
      price: null as number | null,
    },
    {
      id: 'hero-burgers',
      image: '/images/dish-burgers.webp',
      kicker: 'Signature Grill · Gourmet Beef & Crunch',
      title: 'Lava Sizzler Beef Burger',
      subtitle:
        'Juicy beef patty, melted cheese, fiery lava sauce, and fresh lettuce packed into a toasted brioche bun.',
      ctaLabel: 'Add to Order',
      itemId: 'burger-lava-sizzler',
      price: 1199,
    },
    {
      id: 'hero-bbq',
      image: '/images/dish-bbq.webp',
      kicker: 'Live Charcoal Pit · Serves 3–4',
      title: 'King BBQ Platter',
      subtitle:
        'Hunzai Mutton Kabab, Turkish Kabab, Reshmi Kabab, Beef Behari Boti, Labnani Boti & Bihari Tikka over fragrant rice.',
      ctaLabel: 'Add to Order',
      itemId: 'bbq-king-platter',
      price: 4400,
    },
    {
      id: 'hero-karahi',
      image: '/images/dish-karahi.webp',
      kicker: 'Sizzling Wok & Clay Pot',
      title: 'Mutton Koyla Karahi',
      subtitle:
        'Tender mutton simmered with tomatoes, ginger, green chilies & authentic smoky coal aroma.',
      ctaLabel: 'Add to Order',
      itemId: 'karahi-mutton-koyla',
      price: 2700,
    },
    {
      id: 'hero-pasta',
      image: '/images/dish-pasta.webp',
      kicker: 'Cafe Specialties',
      title: 'Signature Matka Pasta',
      subtitle:
        'Bubbling cheese-topped creamy pasta baked fresh in a traditional terracotta pot.',
      ctaLabel: 'Add to Order',
      itemId: 'pasta-signature-matka',
      price: 1399,
    },
    {
      id: 'hero-kunafa',
      image: '/images/dish-kunafa.webp',
      kicker: 'Artisanal Desserts',
      title: 'Crispy Arabic Kunafa',
      subtitle:
        'Golden spun pastry layered with rich cream, delicate sweet syrup & generous crushed pistachios.',
      ctaLabel: 'Add to Order',
      itemId: 'dessert-arabic-kunafa',
      price: 749,
    },
  ];

  // Continuous 2-second loop
  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 2000);
    return () => window.clearInterval(interval);
  }, [slides.length]);

  const current = slides[activeSlide];
  const isDark = theme === 'dark';

  return (
    <section
      id="top"
      className="relative w-full overflow-hidden border-b border-red-200/80 dark:border-red-900/40"
    >
      <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[520px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current.id}-${theme}`}
            initial={{ opacity: 0.25, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.2 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <LazyWebpImage
              src={current.image}
              alt={current.title}
              priority
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Complete Light Mode Bright Creamy-Rose Scrim vs Dark Mode Crimson-Black Scrim */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 transition-colors duration-300 ${
            isDark
              ? 'bg-gradient-to-r from-black/90 via-[#1a0509]/72 to-black/20'
              : 'bg-gradient-to-r from-[#fff5f5]/95 via-[#fff1f2]/82 to-[#fff5f5]/15'
          }`}
        />

        {/* Hero Foreground Copy */}
        <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 flex flex-col justify-end pb-12 sm:pb-14 lg:justify-center lg:pb-0">
          <div className={`max-w-xl ${isDark ? 'text-white' : 'text-[#1c0b0e]'}`}>
            <p
              className={`text-xs sm:text-sm font-semibold mb-2 tracking-wide ${
                isDark ? 'text-rose-200' : 'text-red-700'
              }`}
            >
              {current.kicker}
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-balance">
              {current.title}
            </h1>
            <p
              className={`mt-3 text-sm sm:text-base leading-relaxed line-clamp-2 sm:line-clamp-none ${
                isDark ? 'text-rose-100/90' : 'text-stone-700 font-medium'
              }`}
            >
              {current.subtitle}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  current.itemId ? onOrderItem(current.itemId) : onExploreMenu()
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-semibold text-sm shadow-lg shadow-red-950/30 transition-all cursor-pointer whitespace-nowrap"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{current.ctaLabel}</span>
                {current.price !== null && (
                  <span className="font-mono tabular-nums opacity-95">
                    · {formatPKR(current.price)}
                  </span>
                )}
              </button>

              <a
                href="https://maps.app.goo.gl/VhQ31c1YeHh6Apwq8"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 sm:py-3 rounded-xl backdrop-blur-md text-sm font-semibold border transition-colors whitespace-nowrap ${
                  isDark
                    ? 'bg-white/15 hover:bg-white/25 text-white border-white/25'
                    : 'bg-white/90 hover:bg-white text-stone-900 border-red-200 shadow-sm'
                }`}
              >
                <MapPin className={`w-4 h-4 ${isDark ? 'text-rose-300' : 'text-red-600'}`} />
                <span>Directions</span>
              </a>
            </div>

            <div
              className={`mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium ${
                isDark ? 'text-rose-100/80' : 'text-stone-700'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-amber-300' : 'text-red-600'}`} />
                5:30 PM – 3:00 AM
              </span>
              <span aria-hidden="true">·</span>
              <span>Dining · Takeaway · Home Delivery</span>
            </div>
          </div>
        </div>

        {/* Slide Controls */}
        <div className="absolute bottom-3.5 right-4 sm:bottom-5 sm:right-6 z-20 flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setActiveSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === activeSlide
                    ? 'w-6 bg-red-600'
                    : isDark
                      ? 'w-2 bg-white/40 hover:bg-white/70'
                      : 'w-2 bg-stone-900/30 hover:bg-stone-900/60'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() =>
              setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)
            }
            className={`w-8 h-8 rounded-lg backdrop-blur-md flex items-center justify-center border cursor-pointer transition-colors ${
              isDark
                ? 'bg-black/45 hover:bg-black/70 text-white border-white/15'
                : 'bg-white/85 hover:bg-white text-stone-800 border-red-200 shadow-sm'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
            className={`w-8 h-8 rounded-lg backdrop-blur-md flex items-center justify-center border cursor-pointer transition-colors ${
              isDark
                ? 'bg-black/45 hover:bg-black/70 text-white border-white/15'
                : 'bg-white/85 hover:bg-white text-stone-800 border-red-200 shadow-sm'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
