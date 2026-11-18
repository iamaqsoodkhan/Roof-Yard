import React, { useEffect, useState } from 'react';
import {
  Bike,
  CheckCircle2,
  ChefHat,
  MessageCircle,
  PackageCheck,
  Receipt,
  Timer,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { OrderRecord, OrderStatus } from '../types';
import { formatPKR } from '../utils/deliveryPricing';

interface OrderTrackingModalProps {
  order: OrderRecord | null;
  onClose: () => void;
  onAdvanceStatus?: (orderId: string, nextStatus: OrderStatus) => void;
}

const STAGES: { key: OrderStatus; label: string; deliverySub: string; counterSub: string }[] = [
  {
    key: 'confirmed',
    label: 'Order Confirmed',
    deliverySub: 'Received at Roof Yard kitchen',
    counterSub: 'Received at Roof Yard',
  },
  {
    key: 'cooking',
    label: 'Cooking',
    deliverySub: 'Sizzling on the rooftop grill',
    counterSub: 'Freshly prepared for you',
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    deliverySub: 'Rider en route to your area',
    counterSub: 'Ready at Roof Yard',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    deliverySub: 'Enjoy your meal',
    counterSub: 'Completed',
  },
];

function getEstimatedTotalSeconds(order: OrderRecord): number {
  const prepSeconds = 18 * 60;
  if (order.orderType !== 'delivery') {
    return prepSeconds;
  }
  const travelMinutes = Math.min(20, Math.max(5, Math.round(order.distanceKm * 1.4)));
  return prepSeconds + travelMinutes * 60;
}

function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  onClose,
  onAdvanceStatus,
}) => {
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Live 1-second tick for visual countdown timer
  useEffect(() => {
    if (!order || order.status === 'delivered') return;
    setNowMs(Date.now());
    const tick = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(tick);
  }, [order?.id, order?.status]);

  // Smooth automatic live stage progression simulation while tracking modal is open
  useEffect(() => {
    if (!order || !onAdvanceStatus) return;
    if (order.status === 'delivered') return;

    const nextMap: Record<OrderStatus, OrderStatus | null> = {
      confirmed: 'cooking',
      cooking: 'out_for_delivery',
      out_for_delivery: 'delivered',
      delivered: null,
    };

    const next = nextMap[order.status];
    if (!next) return;

    const timer = window.setTimeout(() => {
      onAdvanceStatus(order.id, next);
    }, 5500);

    return () => window.clearTimeout(timer);
  }, [order, onAdvanceStatus]);

  if (!order) return null;

  const currentIdx = Math.max(
    0,
    STAGES.findIndex((s) => s.key === order.status),
  );
  const progressPercent = ((currentIdx + 1) / STAGES.length) * 100;

  // Countdown calculations
  const totalEstSeconds = getEstimatedTotalSeconds(order);
  const elapsedSeconds = Math.max(0, (nowMs - order.createdAtMs) / 1000);

  const rawRemaining = Math.max(0, Math.round(totalEstSeconds - elapsedSeconds));
  const remainingSeconds =
    order.status === 'delivered' ||
    (order.status === 'out_for_delivery' && order.orderType !== 'delivery')
      ? 0
      : order.status === 'out_for_delivery'
        ? Math.min(rawRemaining, 10 * 60)
        : rawRemaining;

  const ringProgress =
    totalEstSeconds > 0
      ? Math.min(1, Math.max(0.06, 1 - remainingSeconds / totalEstSeconds))
      : 1;
  const ringRadius = 25;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashOffset = ringCircumference * (1 - ringProgress);

  const etaClock = new Date(order.createdAtMs + totalEstSeconds * 1000).toLocaleTimeString(
    'en-PK',
    { hour: 'numeric', minute: '2-digit' },
  );

  const countdownCaption =
    order.status === 'delivered'
      ? order.orderType === 'dining'
        ? 'Served at your rooftop table'
        : order.orderType === 'takeaway'
          ? 'Picked up · Enjoy your meal'
          : 'Delivered · Enjoy your meal'
      : order.status === 'out_for_delivery'
        ? order.orderType === 'delivery'
          ? 'Rider on the way to your location'
          : 'Freshly packed and ready at counter'
        : order.status === 'cooking'
          ? 'Grilling & preparing your dishes now'
          : 'Kitchen confirming & firing up the grill';

  const whatsappSummary = encodeURIComponent(
    `Hello Roof Yard! Tracking my order #${order.orderNumber} (${order.orderType.toUpperCase()}) - Total: ${formatPKR(order.total)}.`,
  );

  const stageIcons = [Receipt, ChefHat, Bike, PackageCheck];

  return (
    <AnimatePresence>
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
          className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-[#18070b] border border-red-200 dark:border-red-900/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-red-100 dark:border-red-900/40 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                Live Order Tracking · {order.orderType === 'delivery' ? 'Cash on Delivery' : 'Pay at Counter'}
              </p>
              <h2 className="font-display text-lg font-bold text-stone-900 dark:text-white font-mono">
                Order #{order.orderNumber}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close tracking modal"
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-red-50 dark:hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-5">
            {/* Visual Preparation & ETA Countdown Timer Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-red-50/70 to-amber-50/50 dark:from-[#260910] dark:via-[#1e070c] dark:to-[#1b0907] border border-red-200/80 dark:border-red-800/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Circular SVG Progress Countdown Ring */}
                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 60 60" aria-hidden="true">
                    <circle
                      cx="30"
                      cy="30"
                      r={ringRadius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4.5"
                      className="text-red-200/80 dark:text-red-950"
                    />
                    <motion.circle
                      cx="30"
                      cy="30"
                      r={ringRadius}
                      fill="none"
                      stroke={remainingSeconds === 0 ? '#10b981' : 'url(#roofyardTimerGrad)'}
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      animate={{ strokeDashoffset: ringDashOffset }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                    <defs>
                      <linearGradient id="roofyardTimerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#dc2626" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <Timer
                    className={`w-5 h-5 absolute ${
                      remainingSeconds === 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">
                    {remainingSeconds === 0 ? 'Order Ready' : 'Est. Preparation & Arrival'}
                  </p>
                  <p className="text-xs text-stone-700 dark:text-stone-300 mt-0.5 leading-snug">
                    {countdownCaption}
                  </p>
                  {remainingSeconds > 0 && (
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      Estimated completion ~{etaClock}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`font-mono text-xl sm:text-2xl font-bold tabular-nums tracking-tight ${
                    remainingSeconds === 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-stone-900 dark:text-white'
                  }`}
                >
                  {remainingSeconds === 0 ? '00:00' : formatCountdown(remainingSeconds)}
                </span>
                <span className="block text-[10px] font-medium text-stone-500 dark:text-stone-400">
                  {remainingSeconds === 0 ? 'Completed' : 'mm:ss left'}
                </span>
              </div>
            </div>

            {/* Animated Framer Motion Progress Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-200">
                <span>{STAGES[currentIdx].label}</span>
                <span className="tabular-nums text-red-600 dark:text-red-400">
                  {Math.round(progressPercent)}%
                </span>
              </div>

              <div className="h-2.5 w-full rounded-full bg-rose-100 dark:bg-red-950/70 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500"
                />
              </div>

              {/* Stage Nodes */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                {STAGES.map((stage, idx) => {
                  const Icon = stageIcons[idx];
                  const completed = idx <= currentIdx;
                  const active = idx === currentIdx;
                  const label =
                    order.orderType !== 'delivery' && stage.key === 'out_for_delivery'
                      ? 'Ready'
                      : order.orderType === 'dining' && stage.key === 'delivered'
                        ? 'Served'
                        : stage.label.replace('Order ', '');

                  return (
                    <motion.div
                      key={stage.key}
                      animate={active ? { y: [0, -2, 0] } : {}}
                      transition={{ duration: 1.5, repeat: active ? Infinity : 0 }}
                      className="flex flex-col items-center text-center"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          completed
                            ? 'bg-red-600 text-white shadow-md shadow-red-900/20'
                            : 'bg-rose-50 dark:bg-white/5 text-stone-400 border border-red-100 dark:border-red-900/40'
                        }`}
                      >
                        {completed && idx < currentIdx ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <span
                        className={`mt-1.5 text-[11px] font-semibold leading-tight ${
                          completed
                            ? 'text-stone-900 dark:text-white'
                            : 'text-stone-400 dark:text-stone-500'
                        }`}
                      >
                        {label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Destination & Customer Details */}
            <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-white/5 border border-red-100 dark:border-red-900/40 text-xs space-y-1 text-stone-700 dark:text-stone-300">
              <p className="font-semibold text-stone-900 dark:text-white">
                {order.customerName} · {order.customerPhone}
              </p>
              <p>
                {order.areaName} — {order.address}
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Order Items
              </p>
              <div className="divide-y divide-red-100 dark:divide-red-900/30 rounded-xl border border-red-100 dark:border-red-900/40 overflow-hidden">
                {order.items.map((it, idx) => (
                  <div
                    key={`${it.name}-${idx}`}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs bg-white/60 dark:bg-black/20"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-stone-900 dark:text-white">
                        {it.quantity}× {it.name}
                      </span>
                      {(it.variant || it.addon) && (
                        <span className="block text-[11px] text-stone-500 dark:text-stone-400">
                          {[it.variant, it.addon].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold tabular-nums text-stone-800 dark:text-stone-200 shrink-0">
                      {formatPKR(it.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-1 text-xs">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatPKR(order.subtotal)}</span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Delivery Charge ({order.distanceKm} km)</span>
                    <span className="tabular-nums">{formatPKR(order.deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-stone-900 dark:text-white pt-1.5 border-t border-red-100 dark:border-red-900/40">
                  <span>Total Amount</span>
                  <span className="tabular-nums text-red-700 dark:text-red-400">
                    {formatPKR(order.total)}
                  </span>
                </div>
              </div>
            </div>

            <a
              href={`https://wa.me/923196639273?text=${whatsappSummary}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat with Roof Yard on WhatsApp</span>
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
