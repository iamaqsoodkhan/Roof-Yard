import React, { useEffect, useState } from 'react';
import {
  Check,
  Clock,
  LogOut,
  MapPin,
  Package,
  Phone,
  Save,
  ShieldCheck,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { KARACHI_AREAS } from '../data/karachiAreas';
import { logoutUser, signInWithGoogle } from '../firebase';
import { OrderRecord, ThemeMode, UserProfile } from '../types';
import { formatPKR } from '../utils/deliveryPricing';

interface AuthAndDashboardModalProps {
  open: boolean;
  onClose: () => void;
  theme: ThemeMode;
  user: UserProfile | null;
  orders: OrderRecord[];
  onSaveProfile: (updates: {
    phone: string;
    savedArea: string;
    savedAddress: string;
  }) => Promise<void>;
  onTrackOrder: (order: OrderRecord) => void;
}

export const AuthAndDashboardModal: React.FC<AuthAndDashboardModalProps> = ({
  open,
  onClose,
  theme,
  user,
  orders,
  onSaveProfile,
  onTrackOrder,
}) => {
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [phone, setPhone] = useState('');
  const [savedArea, setSavedArea] = useState('');
  const [savedAddress, setSavedAddress] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      setSavedArea(user.savedArea || '');
      setSavedAddress(user.savedAddress || '');
    }
  }, [user]);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Google Sign-In was cancelled or blocked by popup settings.',
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSavedSuccess(false);
    try {
      await onSaveProfile({
        phone: phone.trim(),
        savedArea: savedArea.trim(),
        savedAddress: savedAddress.trim(),
      });
      setSavedSuccess(true);
      window.setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-xl rounded-2xl bg-white dark:bg-[#16060a] border border-red-200 dark:border-red-900/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-red-100 dark:border-red-900/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={theme === 'dark' ? '/images/logo-dark.webp' : '/images/logo-light.webp'}
                  alt="Roof Yard"
                  className="h-8 w-auto object-contain"
                />
                <h2 className="font-display text-lg font-bold text-stone-900 dark:text-white">
                  {user ? 'Customer Dashboard' : 'Welcome to Roof Yard'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close account modal"
                className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-red-50 dark:hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-6">
              {!user ? (
                /* Premium Google Login Card */
                <div className="py-4 text-center space-y-5">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600/15 to-rose-700/20 border border-red-300/50 dark:border-red-800/50 flex items-center justify-center text-red-600 dark:text-red-400">
                    <ShieldCheck className="w-7 h-7" />
                  </div>

                  <div className="space-y-1.5 max-w-sm mx-auto">
                    <h3 className="font-display text-xl font-bold text-stone-900 dark:text-white">
                      Sign in with Google
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                      Save your Karachi delivery address, access live order tracking, and view your full Roof Yard order history.
                    </p>
                  </div>

                  {authError && (
                    <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl px-3 py-2 max-w-sm mx-auto">
                      {authError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full max-w-sm mx-auto py-3 px-5 rounded-xl bg-white dark:bg-[#230b10] hover:bg-rose-50 dark:hover:bg-[#2e0e15] border border-red-200 dark:border-red-800/60 text-stone-900 dark:text-white font-semibold text-sm flex items-center justify-center gap-3 shadow-md transition-all disabled:opacity-60 cursor-pointer"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
                    <span>{authLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                  </button>
                </div>
              ) : (
                /* Authenticated Customer Dashboard */
                <>
                  {/* Profile Banner */}
                  <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-red-600/10 via-rose-500/10 to-transparent border border-red-200 dark:border-red-900/40">
                    <div className="flex items-center gap-3 min-w-0">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-full object-cover border-2 border-red-500 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-base text-stone-900 dark:text-white truncate">
                          {user.displayName}
                        </h3>
                        <p className="text-xs text-stone-600 dark:text-stone-300 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => logoutUser()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#240a0f] border border-red-200 dark:border-red-900/50 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/60 shrink-0 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>

                  {/* Saved Delivery Details */}
                  <form onSubmit={handleProfileSubmit} className="space-y-3">
                    <h4 className="font-display text-sm font-bold text-stone-900 dark:text-white">
                      Saved Contact &amp; Karachi Area
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="flex items-center gap-1 text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">
                          <Phone className="w-3 h-3" />
                          <span>Phone Number</span>
                        </label>
                        <input
                          type="tel"
                          maxLength={24}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="03XX-XXXXXXX"
                          className="w-full px-3 py-2 rounded-xl bg-rose-50/70 dark:bg-black/40 border border-red-200 dark:border-red-900/50 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-1 text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">
                          <MapPin className="w-3 h-3" />
                          <span>Default Area</span>
                        </label>
                        <select
                          value={savedArea}
                          onChange={(e) => setSavedArea(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-rose-50/70 dark:bg-black/40 border border-red-200 dark:border-red-900/50 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="">Select Karachi area</option>
                          {KARACHI_AREAS.map((a) => (
                            <option key={a.id} value={a.name}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        maxLength={300}
                        value={savedAddress}
                        onChange={(e) => setSavedAddress(e.target.value)}
                        placeholder="Default street / flat / house address"
                        className="w-full px-3 py-2 rounded-xl bg-rose-50/70 dark:bg-black/40 border border-red-200 dark:border-red-900/50 text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {savedSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Preferences Saved</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>{savingProfile ? 'Saving...' : 'Save Preferences'}</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Order History */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span>Your Orders ({orders.length})</span>
                      </h4>
                    </div>

                    {orders.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-rose-50/60 dark:bg-white/5 border border-red-100 dark:border-red-900/40 text-center text-xs text-stone-500 dark:text-stone-400">
                        You have not placed any orders yet. Add dishes from our menu to get started!
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {orders.map((ord) => (
                          <div
                            key={ord.id}
                            className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-white/5 border border-red-100 dark:border-red-900/40 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 text-xs font-semibold text-stone-900 dark:text-white">
                                <span className="font-mono">#{ord.orderNumber}</span>
                                <span aria-hidden="true">·</span>
                                <span className="capitalize text-red-700 dark:text-red-400">
                                  {ord.status.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                                {ord.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                              </p>
                              <p className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(ord.createdAtMs).toLocaleString()}</span>
                              </p>
                            </div>

                            <div className="text-right shrink-0 space-y-1">
                              <p className="text-sm font-bold tabular-nums text-stone-900 dark:text-white">
                                {formatPKR(ord.total)}
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onTrackOrder(ord);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold cursor-pointer"
                              >
                                Track Order
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
