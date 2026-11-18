import React, { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { AnimatePresence, motion } from 'motion/react';
import { AuthAndDashboardModal } from './components/AuthAndDashboardModal';
import { CartDrawer } from './components/CartDrawer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { HeroSlider } from './components/HeroSlider';
import { LocationModal } from './components/LocationModal';
import { MenuSection } from './components/MenuSection';
import { Navbar } from './components/Navbar';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { PromoBanner } from './components/PromoBanner';
import { SplashScreen } from './components/SplashScreen';
import { KARACHI_AREAS } from './data/karachiAreas';
import { MENU_ITEMS } from './data/menuData';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  testConnection,
} from './firebase';
import {
  CartItem,
  FlyingThumbnail,
  KarachiArea,
  MenuItem,
  OrderRecord,
  OrderStatus,
  OrderType,
  PaymentMethod,
  ThemeMode,
  UserProfile,
} from './types';

function RoofYardApp() {
  // Theme state (persisted)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('roofyard_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('roofyard_theme', theme);
  }, [theme]);

  // Splash Screen
  const [showSplash, setShowSplash] = useState(true);

  // Promo Banner
  const [promoVisible, setPromoVisible] = useState(true);

  // Location & First-Visit Auto Prompt
  const [selectedArea, setSelectedArea] = useState<KarachiArea | null>(() => {
    const savedId = localStorage.getItem('roofyard_area_id');
    return KARACHI_AREAS.find((a) => a.id === savedId) || null;
  });
  const [customCoords, setCustomCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Trigger first-time location modal ONLY once (never on subsequent refreshes)
  useEffect(() => {
    if (showSplash) return;
    const alreadyPrompted = localStorage.getItem('roofyard_location_prompted');
    if (!alreadyPrompted) {
      localStorage.setItem('roofyard_location_prompted', '1');
      const t = window.setTimeout(() => setLocationModalOpen(true), 250);
      return () => window.clearTimeout(t);
    }
  }, [showSplash]);

  // Menu & Cart State
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem('roofyard_cart');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const cartButtonRef = useRef<HTMLButtonElement | null>(null);
  const [flyingThumbnails, setFlyingThumbnails] = useState<FlyingThumbnail[]>([]);

  useEffect(() => {
    localStorage.setItem('roofyard_cart', JSON.stringify(cart));
  }, [cart]);

  // Auth & Dashboard State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const raw = localStorage.getItem('roofyard_guest_orders');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [trackingOrder, setTrackingOrder] = useState<OrderRecord | null>(null);

  // Boot Firestore connection check & Auth listener
  useEffect(() => {
    testConnection();

    let unsubOrders: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (unsubOrders) {
        unsubOrders();
        unsubOrders = null;
      }

      if (!fbUser) {
        setUserProfile(null);
        try {
          const raw = localStorage.getItem('roofyard_guest_orders');
          setOrders(raw ? JSON.parse(raw) : []);
        } catch {
          setOrders([]);
        }
        return;
      }

      const userPath = `users/${fbUser.uid}`;
      const userRef = doc(db, 'users', fbUser.uid);

      try {
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const d = snap.data();
          const loaded: UserProfile = {
            uid: fbUser.uid,
            displayName: d.displayName || fbUser.displayName || 'Roof Yard Guest',
            email: d.email || fbUser.email || '',
            photoURL: d.photoURL || fbUser.photoURL || '',
            phone: d.phone || '',
            savedArea: d.savedArea || '',
            savedAddress: d.savedAddress || '',
          };
          setUserProfile(loaded);
          if (loaded.savedArea && !selectedArea) {
            const matched = KARACHI_AREAS.find((a) => a.name === loaded.savedArea);
            if (matched) setSelectedArea(matched);
          }
        } else {
          const fresh: UserProfile = {
            uid: fbUser.uid,
            displayName: (fbUser.displayName || 'Customer').slice(0, 100),
            email: (fbUser.email || '').slice(0, 150),
            photoURL: (fbUser.photoURL || '').slice(0, 500),
            phone: '',
            savedArea: selectedArea?.name || '',
            savedAddress: '',
          };
          await setDoc(userRef, {
            ...fresh,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          setUserProfile(fresh);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, userPath);
      }

      // Live listener for customer's orders
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', fbUser.uid),
      );
      unsubOrders = onSnapshot(
        ordersQuery,
        (snapshot) => {
          const list: OrderRecord[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            const createdTs = data.createdAt as Timestamp | undefined;
            return {
              id: docSnap.id,
              orderNumber: data.orderNumber,
              userId: data.userId,
              customerName: data.customerName,
              customerPhone: data.customerPhone,
              customerEmail: data.customerEmail,
              orderType: data.orderType,
              areaName: data.areaName,
              address: data.address,
              distanceKm: data.distanceKm,
              subtotal: data.subtotal,
              deliveryFee: data.deliveryFee,
              total: data.total,
              paymentMethod: data.paymentMethod,
              status: data.status,
              items: data.items || [],
              notes: data.notes || '',
              createdAtMs: createdTs ? createdTs.toMillis() : Date.now(),
            };
          });
          list.sort((a, b) => b.createdAtMs - a.createdAtMs);
          setOrders(list);

          setTrackingOrder((prev) => {
            if (!prev) return null;
            const refreshed = list.find((o) => o.id === prev.id);
            return refreshed || prev;
          });
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'orders');
        },
      );
    });

    return () => {
      unsubAuth();
      if (unsubOrders) unsubOrders();
    };
  }, []);

  const handleSelectArea = (
    area: KarachiArea,
    coords?: { lat: number; lng: number } | null,
  ) => {
    setSelectedArea(area);
    setCustomCoords(coords || null);
    localStorage.setItem('roofyard_area_id', area.id);
  };

  // Smooth parabolic Fly-to-Cart animation + Cart addition
  const triggerFlyToCart = useCallback((imageSrc: string, rect?: DOMRect) => {
    const cartRect = cartButtonRef.current?.getBoundingClientRect();
    if (!rect || !cartRect) {
      setCartPulse(true);
      window.setTimeout(() => setCartPulse(false), 380);
      return;
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const flyItem: FlyingThumbnail = {
      id,
      src: imageSrc,
      startX: rect.left + rect.width / 2 - 26,
      startY: rect.top + rect.height / 2 - 26,
      targetX: cartRect.left + cartRect.width / 2 - 18,
      targetY: cartRect.top + cartRect.height / 2 - 18,
    };

    setFlyingThumbnails((prev) => [...prev, flyItem]);

    window.setTimeout(() => {
      setCartPulse(true);
      window.setTimeout(() => setCartPulse(false), 380);
    }, 780);

    window.setTimeout(() => {
      setFlyingThumbnails((prev) => prev.filter((f) => f.id !== id));
    }, 950);
  }, []);

  const handleAddToCart = (
    item: MenuItem,
    variantLabel?: string,
    addonLabel?: string,
    unitPrice?: number,
    imgRect?: DOMRect,
  ) => {
    const finalPrice = unitPrice ?? item.price;
    const cartKey = `${item.id}__${variantLabel || 'std'}__${addonLabel || 'none'}`;

    setCart((prev) => {
      const existing = prev.find((c) => c.cartKey === cartKey);
      if (existing) {
        return prev.map((c) =>
          c.cartKey === cartKey ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [
        ...prev,
        {
          cartKey,
          itemId: item.id,
          name: item.name,
          image: item.image,
          variantLabel,
          addonLabel,
          unitPrice: finalPrice,
          quantity: 1,
        },
      ];
    });

    triggerFlyToCart(item.image, imgRect);
  };

  const handleUpdateQty = (cartKey: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.cartKey === cartKey ? { ...c, quantity: c.quantity + delta } : c,
        )
        .filter((c) => c.quantity > 0),
    );
  };

  const handleRemoveItem = (cartKey: string) => {
    setCart((prev) => prev.filter((c) => c.cartKey !== cartKey));
  };

  const handleOrderItemFromHero = (itemId: string) => {
    const found = MENU_ITEMS.find((m) => m.id === itemId);
    if (!found) return;
    const defaultVariant = found.variants?.[0];
    handleAddToCart(
      found,
      defaultVariant?.label,
      undefined,
      defaultVariant ? defaultVariant.price : found.price,
    );
    setCartOpen(true);
  };

  const handleScrollToCategory = (category: string) => {
    setActiveCategory(category);
    const el = document.getElementById('menu-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaveProfile = async (updates: {
    phone: string;
    savedArea: string;
    savedAddress: string;
  }) => {
    if (!userProfile) return;
    const userRef = doc(db, 'users', userProfile.uid);
    try {
      await updateDoc(userRef, {
        phone: updates.phone.slice(0, 24),
        savedArea: updates.savedArea.slice(0, 100),
        savedAddress: updates.savedAddress.slice(0, 300),
        updatedAt: serverTimestamp(),
      });
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
      if (updates.savedArea) {
        const matched = KARACHI_AREAS.find((a) => a.name === updates.savedArea);
        if (matched) handleSelectArea(matched, null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userProfile.uid}`);
    }
  };

  const handlePlaceOrder = async (payload: {
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
  }) => {
    const orderNumber = `RY-${Math.floor(10000 + Math.random() * 90000)}`;
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const itemsPayload = cart.slice(0, 40).map((c) => ({
      name: c.name,
      ...(c.variantLabel ? { variant: c.variantLabel } : {}),
      ...(c.addonLabel ? { addon: c.addonLabel } : {}),
      quantity: c.quantity,
      unitPrice: c.unitPrice,
      lineTotal: c.unitPrice * c.quantity,
    }));

    const newRecord: OrderRecord = {
      id: orderId,
      orderNumber,
      userId: userProfile?.uid || 'guest',
      customerName: payload.customerName.slice(0, 100),
      customerPhone: payload.customerPhone.slice(0, 24),
      customerEmail: payload.customerEmail.slice(0, 150),
      orderType: payload.orderType,
      areaName: payload.areaName.slice(0, 100),
      address: payload.address.slice(0, 300),
      distanceKm: payload.distanceKm,
      subtotal: payload.subtotal,
      deliveryFee: payload.deliveryFee,
      total: payload.total,
      paymentMethod: payload.paymentMethod,
      status: 'confirmed',
      items: itemsPayload,
      notes: payload.notes.slice(0, 400),
      createdAtMs: Date.now(),
    };

    if (userProfile) {
      const docRef = doc(db, 'orders', orderId);
      try {
        await setDoc(docRef, {
          orderNumber: newRecord.orderNumber,
          userId: userProfile.uid,
          customerName: newRecord.customerName,
          customerPhone: newRecord.customerPhone,
          customerEmail: newRecord.customerEmail,
          orderType: newRecord.orderType,
          areaName: newRecord.areaName,
          address: newRecord.address,
          distanceKm: newRecord.distanceKm,
          subtotal: newRecord.subtotal,
          deliveryFee: newRecord.deliveryFee,
          total: newRecord.total,
          paymentMethod: newRecord.paymentMethod,
          status: 'confirmed',
          items: itemsPayload,
          notes: newRecord.notes,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`);
      }
    } else {
      setOrders((prev) => {
        const next = [newRecord, ...prev];
        localStorage.setItem('roofyard_guest_orders', JSON.stringify(next));
        return next;
      });
    }

    setCart([]);
    setCartOpen(false);
    setTrackingOrder(newRecord);
  };

  const handleAdvanceOrderStatus = useCallback(
    async (orderId: string, nextStatus: OrderStatus) => {
      setTrackingOrder((prev) =>
        prev && prev.id === orderId ? { ...prev, status: nextStatus } : prev,
      );

      if (userProfile) {
        try {
          await updateDoc(doc(db, 'orders', orderId), {
            status: nextStatus,
            updatedAt: serverTimestamp(),
          });
        } catch {
          // Ignore transient permission or terminal state transitions
        }
      } else {
        setOrders((prev) => {
          const next = prev.map((o) =>
            o.id === orderId ? { ...o, status: nextStatus } : o,
          );
          localStorage.setItem('roofyard_guest_orders', JSON.stringify(next));
          return next;
        });
      }
    },
    [userProfile],
  );

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-clip">
      {/* Opening Celebration Splash Screen */}
      <SplashScreen
        show={showSplash}
        theme={theme}
        onFinish={() => setShowSplash(false)}
      />

      {/* Dismissible Top Promotional Banner */}
      <PromoBanner
        visible={promoVisible}
        onDismiss={() => setPromoVisible(false)}
        onSelectDeals={() => handleScrollToCategory('BBQ & Platters')}
      />

      {/* Sticky Top Navbar */}
      <Navbar
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        selectedArea={selectedArea}
        onOpenLocation={() => setLocationModalOpen(true)}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        cartButtonRef={cartButtonRef}
        cartPulse={cartPulse}
        user={userProfile}
        onOpenAuthOrDashboard={() => setAuthModalOpen(true)}
        onScrollToCategory={handleScrollToCategory}
      />

      {/* Main Content */}
      <main className="flex-1">
        <HeroSlider
          theme={theme}
          onOrderItem={handleOrderItemFromHero}
          onExploreMenu={() => handleScrollToCategory('All')}
        />

        <MenuSection
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
        />
      </main>

      <Footer theme={theme} />

      {/* Smooth Parabolic Fly-to-Cart Animation Overlay */}
      <AnimatePresence>
        {flyingThumbnails.map((thumb) => (
          <motion.img
            key={thumb.id}
            src={thumb.src}
            alt=""
            aria-hidden="true"
            initial={{
              position: 'fixed',
              left: thumb.startX,
              top: thumb.startY,
              width: 68,
              height: 68,
              borderRadius: 16,
              opacity: 1,
              scale: 1,
              zIndex: 95,
              pointerEvents: 'none',
            }}
            animate={{
              left: [
                thumb.startX,
                (thumb.startX + thumb.targetX) / 2,
                thumb.targetX,
              ],
              top: [
                thumb.startY,
                Math.min(thumb.startY, thumb.targetY) - 85,
                thumb.targetY,
              ],
              scale: [1.05, 0.85, 0.3],
              opacity: [1, 0.95, 0.15],
            }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="object-cover shadow-2xl ring-2 ring-red-500"
          />
        ))}
      </AnimatePresence>

      {/* First-Time & On-Demand Karachi Location Modal */}
      <LocationModal
        open={locationModalOpen}
        selectedArea={selectedArea}
        onSelectArea={handleSelectArea}
        onClose={() => setLocationModalOpen(false)}
      />

      {/* Cart & Checkout Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        selectedArea={selectedArea}
        customCoords={customCoords}
        onOpenLocation={() => setLocationModalOpen(true)}
        user={userProfile}
        onPlaceOrder={handlePlaceOrder}
      />

      {/* Post-Order Live Tracking Modal */}
      <OrderTrackingModal
        order={trackingOrder}
        onClose={() => setTrackingOrder(null)}
        onAdvanceStatus={handleAdvanceOrderStatus}
      />

      {/* Real Google Sign-In & Customer Dashboard */}
      <AuthAndDashboardModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        theme={theme}
        user={userProfile}
        orders={orders}
        onSaveProfile={handleSaveProfile}
        onTrackOrder={(ord) => setTrackingOrder(ord)}
      />

      {/* Left-Anchored Floating WhatsApp with 3s Wait-Time Expand & Need Help Sound */}
      <FloatingWhatsApp autoExpandOnMount={true} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <RoofYardApp />
    </ErrorBoundary>
  );
}
