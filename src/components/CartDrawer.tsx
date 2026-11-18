import React, { useEffect, useState } from 'react';
import {
  Banknote,
  Bike,
  MapPin,
  Mic,
  MicOff,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CartItem,
  KarachiArea,
  OrderType,
  PaymentMethod,
  UserProfile,
} from '../types';
import {
  calculateAreaDeliveryQuote,
  formatPKR,
} from '../utils/deliveryPricing';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (cartKey: string, delta: number) => void;
  onRemoveItem: (cartKey: string) => void;
  selectedArea: KarachiArea | null;
  customCoords: { lat: number; lng: number } | null;
  onOpenLocation: () => void;
  user: UserProfile | null;
  onPlaceOrder: (payload: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    orderType: OrderType;
    areaName: string;
    address: string;
    distanceKm: number;
    subtotal: number;
    deliveryFee: number;
    total: number;
    paymentMethod: PaymentMethod;
    notes: string;
  }) => Promise<void>;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  selectedArea,
  customCoords,
  onOpenLocation,
  user,
  onPlaceOrder,
}) => {
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [listeningNotes, setListeningNotes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (!customerName && user.displayName) setCustomerName(user.displayName);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
      if (!address && user.savedAddress) setAddress(user.savedAddress);
    }
  }, [user, customerName, customerPhone, address]);

  const subtotal = cart.reduce((acc, c) => acc + c.unitPrice * c.quantity, 0);
  const quote =
    orderType === 'delivery'
      ? calculateAreaDeliveryQuote(selectedArea, customCoords)
      : { distanceKm: 0, deliveryFee: 0 };

  const total = subtotal + quote.deliveryFee;
  const paymentMethod: PaymentMethod =
    orderType === 'delivery' ? 'cod' : 'pay_at_counter';

  const handleVoiceNotes = () => {
    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      setErrorMsg('Voice input is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRec();
    recognition.lang = 'en-PK';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListeningNotes(true);
    setErrorMsg(null);

    recognition.onresult = (ev) => {
      const transcript = ev.results?.[0]?.[0]?.transcript || '';
      if (transcript) {
        setNotes((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
      }
      setListeningNotes(false);
    };
    recognition.onerror = () => setListeningNotes(false);
    recognition.onend = () => setListeningNotes(false);
    recognition.start();
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (cart.length === 0) return;
    if (!customerName.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (customerPhone.trim().length < 7) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }
    if (orderType === 'delivery' && !selectedArea) {
      setErrorMsg('Please select your Karachi delivery area.');
      return;
    }
    if (orderType === 'delivery' && !address.trim()) {
      setErrorMsg('Please enter your house/street address for delivery.');
      return;
    }

    setSubmitting(true);
    try {
      await onPlaceOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: user?.email || '',
        orderType,
        areaName:
          orderType === 'delivery'
            ? selectedArea?.name || 'Karachi'
            : 'North Nazimabad Block E (Roof Yard)',
        address:
          orderType === 'delivery'
            ? address.trim()
            : orderType === 'takeaway'
              ? 'Takeaway Counter Pickup'
              : 'Rooftop Dining Table',
        distanceKm: quote.distanceKm,
        subtotal,
        deliveryFee: quote.deliveryFee,
        total,
        paymentMethod,
        notes: notes.trim(),
      });
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to place order. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 w-full max-w-md h-full flex flex-col bg-white dark:bg-[#16060a] border-l border-red-200 dark:border-red-900/50 shadow-2xl"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-red-100 dark:border-red-900/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h2 className="font-display text-lg font-bold text-stone-900 dark:text-white">
                  Your Order
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close cart drawer"
                className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-red-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <p className="font-display font-semibold text-stone-900 dark:text-white">
                    Your cart is empty
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                    Add sizzling burgers, charcoal BBQ platters, karahi, or kunafa from the menu.
                  </p>
                </div>
              ) : (
                <>
                  {/* Order Mode Selector */}
                  <div>
                    <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                      Select Order Option
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'delivery', label: 'Delivery', icon: Bike },
                          { id: 'takeaway', label: 'Takeaway', icon: Store },
                          { id: 'dining', label: 'Dine-In', icon: UtensilsCrossed },
                        ] as const
                      ).map((opt) => {
                        const Icon = opt.icon;
                        const active = orderType === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setOrderType(opt.id)}
                            className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              active
                                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                                : 'bg-rose-50/70 dark:bg-white/5 text-stone-700 dark:text-stone-300 border-red-200 dark:border-red-900/40 hover:border-red-500'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-2.5">
                    {cart.map((item) => (
                      <div
                        key={item.cartKey}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-rose-50/70 dark:bg-white/5 border border-red-100 dark:border-red-900/40"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-stone-900 dark:text-white truncate">
                            {item.name}
                          </p>
                          {(item.variantLabel || item.addonLabel) && (
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                              {[item.variantLabel, item.addonLabel].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          <p className="text-xs font-bold text-red-700 dark:text-red-400 tabular-nums mt-0.5">
                            {formatPKR(item.unitPrice * item.quantity)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.cartKey, -1)}
                            aria-label="Decrease quantity"
                            className="w-7 h-7 rounded-lg bg-white dark:bg-[#240a0f] border border-red-200 dark:border-red-900/50 flex items-center justify-center text-stone-700 dark:text-stone-200 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold tabular-nums text-stone-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.cartKey, 1)}
                            aria-label="Increase quantity"
                            className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.cartKey)}
                            aria-label="Remove item"
                            className="p-1.5 text-stone-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Details Form */}
                  <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3">
                    {orderType === 'delivery' && (
                      <div className="p-3 rounded-xl bg-rose-50/90 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                            Karachi Delivery Area
                          </span>
                          <button
                            type="button"
                            onClick={onOpenLocation}
                            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                          >
                            {selectedArea ? 'Change' : 'Select Area'}
                          </button>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-300">
                          {selectedArea
                            ? `${selectedArea.name} (${quote.distanceKm} km from Roof Yard)`
                            : 'Tap Select Area or Auto-Detect to calculate delivery fee'}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={100}
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Hamza Tariq"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-rose-50/60 dark:bg-black/40 border border-red-200 dark:border-red-900/50 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                        Mobile / WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={24}
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="03XX-XXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-rose-50/60 dark:bg-black/40 border border-red-200 dark:border-red-900/50 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    {orderType === 'delivery' && (
                      <div>
                        <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                          Street / House / Flat Address
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={300}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="House / Street / Landmark"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-rose-50/60 dark:bg-black/40 border border-red-200 dark:border-red-900/50 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    )}

                    {/* Special Notes with Voice-to-Text */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                          Order Notes / Instructions (Voice Supported)
                        </label>
                        <button
                          type="button"
                          onClick={handleVoiceNotes}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                            listeningNotes
                              ? 'bg-red-600 text-white animate-pulse'
                              : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-white/10'
                          }`}
                        >
                          {listeningNotes ? (
                            <>
                              <MicOff className="w-3 h-3" />
                              <span>Listening...</span>
                            </>
                          ) : (
                            <>
                              <Mic className="w-3 h-3" />
                              <span>Speak</span>
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        maxLength={400}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Spice level, ring bell, table preference..."
                        className="w-full px-3.5 py-2 rounded-xl bg-rose-50/60 dark:bg-black/40 border border-red-200 dark:border-red-900/50 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      />
                    </div>

                    {errorMsg && (
                      <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl px-3 py-2">
                        {errorMsg}
                      </p>
                    )}
                  </form>
                </>
              )}
            </div>

            {/* Footer Totals & Submit */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-red-100 dark:border-red-900/40 bg-rose-50/70 dark:bg-[#1f080d] space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-stone-600 dark:text-stone-300">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-medium">{formatPKR(subtotal)}</span>
                  </div>
                  {orderType === 'delivery' && (
                    <div className="flex justify-between text-stone-600 dark:text-stone-300">
                      <span>Delivery Charge ({quote.distanceKm} km)</span>
                      <span className="tabular-nums font-medium">
                        {formatPKR(quote.deliveryFee)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-stone-900 dark:text-white pt-1.5 border-t border-red-200/70 dark:border-red-900/40">
                    <span>Total ({paymentMethod === 'cod' ? 'Cash on Delivery' : 'Pay at Counter'})</span>
                    <span className="tabular-nums text-red-700 dark:text-red-400">
                      {formatPKR(total)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-900/25 disabled:opacity-60 transition-all cursor-pointer"
                >
                  <Banknote className="w-4 h-4" />
                  <span>
                    {submitting
                      ? 'Confirming Order...'
                      : orderType === 'delivery'
                        ? `Place COD Order · ${formatPKR(total)}`
                        : `Confirm ${orderType === 'takeaway' ? 'Takeaway' : 'Dine-In'} · ${formatPKR(total)}`}
                  </span>
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
