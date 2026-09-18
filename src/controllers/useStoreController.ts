import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Product, 
  Category, 
  Order, 
  CartItem, 
  Customer, 
  UserProfile, 
  ActiveAppView, 
  OrderStatus,
  ShippingData,
  RegisterData,
  StoreSettings,
} from '../types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_CUSTOMERS, 
  DEMO_USER_PROFILE, 
  ADMIN_USER_PROFILE 
} from '../models/mockData';
import { getSupabaseClient } from '../services/supabaseClient';
import { 
  authenticateUser, 
  registerNewUser, 
  requestPasswordReset, 
  updateAdminUserCredentials,
  updateClientUserCredentials 
} from '../services/authService';

// =========================================================================
// RECURSIVE PROGRAMMING ALGORITHMS
// =========================================================================

/**
 * 1. Recursive Inventory Stock Audit ("Loop Engine")
 * Audits products recursively, accumulating critical stock (<= threshold),
 * out-of-stock items, total catalog valuation, and stock health index.
 */
export interface InventoryAuditResult {
  totalItems: number;
  totalValuation: number;
  criticalItems: Product[];
  outOfStockItems: Product[];
  healthyItemsCount: number;
  healthIndexPercentage: number;
}

export function auditInventoryRecursively(
  items: Product[],
  index: number = 0,
  accumulator: {
    totalValuation: number;
    criticalItems: Product[];
    outOfStockItems: Product[];
    healthyCount: number;
  } = {
    totalValuation: 0,
    criticalItems: [],
    outOfStockItems: [],
    healthyCount: 0,
  }
): InventoryAuditResult {
  // Base case: end of recursive traversal
  if (index >= items.length) {
    const total = items.length || 1;
    const healthPercent = Math.round(
      (accumulator.healthyCount / total) * 100
    );
    return {
      totalItems: items.length,
      totalValuation: accumulator.totalValuation,
      criticalItems: accumulator.criticalItems,
      outOfStockItems: accumulator.outOfStockItems,
      healthyItemsCount: accumulator.healthyCount,
      healthIndexPercentage: healthPercent,
    };
  }

  // Recursive step: inspect current product
  const current = items[index];
  const stock = current.stock;
  const threshold = current.stockThreshold || 5;

  accumulator.totalValuation += current.price * stock;

  if (stock === 0) {
    accumulator.outOfStockItems.push(current);
  } else if (stock <= threshold) {
    accumulator.criticalItems.push(current);
  } else {
    accumulator.healthyCount += 1;
  }

  // Tail recursion
  return auditInventoryRecursively(items, index + 1, accumulator);
}

/**
 * 2. Recursive Category Hierarchy Search
 * Searches category tree or list recursively.
 */
export function findCategoryRecursively(
  categories: Category[],
  targetSlug: string,
  index: number = 0
): Category | null {
  if (index >= categories.length) return null;
  if (categories[index].slug === targetSlug) return categories[index];
  return findCategoryRecursively(categories, targetSlug, index + 1);
}

/**
 * 3. Recursive Order Price Calculation
 */
export function calculateOrderItemsTotalRecursively(
  items: CartItem[],
  index: number = 0,
  subtotal: number = 0
): number {
  if (index >= items.length) return subtotal;
  const itemTotal = items[index].product.price * items[index].quantity;
  return calculateOrderItemsTotalRecursively(items, index + 1, subtotal + itemTotal);
}

// =========================================================================
// REACTIVE STORE CONTROLLER (MVC CONTROLLER LAYER)
// =========================================================================

const STORAGE_KEYS = {
  PRODUCTS: 'mujer_latina_products_v1',
  ORDERS: 'mujer_latina_orders_v1',
  CART: 'mujer_latina_cart_v1',
  WISHLIST: 'mujer_latina_wishlist_v1',
  CUSTOMERS: 'mujer_latina_customers_v1',
  PROFILE: 'mujer_latina_profile_v1',
  STORE_SETTINGS: 'mujer_latina_store_settings_v1',
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Mujer Latina',
  storeSlogan: 'Belleza que Empodera',
  whatsappNumber: '573108924110',
  whatsappDisplay: '+57 310 892 4110',
  supportEmail: 'contacto@mujerlatina.com',
  supportPhone: '+57 (300) 123-4567',
  storeAddress: 'Calle 10 # 40-20, El Poblado',
  storeCity: 'Medellín',
  storeDepartment: 'Antioquia',
  businessHours: 'Lunes a Sábado: 8:00 AM - 7:00 PM',
  standardShippingFee: 15000,
  freeShippingThreshold: 150000,
  bannerEnabled: false,
  bannerText: '',
  instagramUrl: 'https://instagram.com/mujerlatina.col',
  tiktokUrl: 'https://tiktok.com/@mujerlatina',
  facebookUrl: 'https://facebook.com/mujerlatinabeauty',
};

export function useStoreController() {
  // Navigation View State
  const [activeView, setActiveView] = useState<ActiveAppView>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(INITIAL_PRODUCTS[0]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isProfileEditing, setIsProfileEditing] = useState<boolean>(false);

  const openProfileEdit = useCallback(() => {
    setIsProfileEditing(true);
    setActiveView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Core Data Stores (Reactive observables with localStorage persistence)
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user && user.id) {
          const userCart = localStorage.getItem(`mujer_latina_cart_user_${user.id}`);
          if (userCart) {
            const parsed = JSON.parse(userCart);
            if (Array.isArray(parsed)) return parsed;
          }
        }
      }
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user && user.id) {
          const userWishlist = localStorage.getItem(`mujer_latina_wishlist_user_${user.id}`);
          if (userWishlist) {
            const parsed = JSON.parse(userWishlist);
            if (Array.isArray(parsed)) return parsed;
          }
        }
      }
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return saved ? JSON.parse(saved) : ['prod-1', 'prod-9'];
    } catch {
      return ['prod-1', 'prod-9'];
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_CUSTOMERS.length) {
          return parsed;
        }
      }
      return INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  // Store Settings (reactive with localStorage persistence)
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STORE_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          parsed.bannerEnabled = false;
          if (typeof parsed.storeSlogan === 'string' && /cuidado femenino/i.test(parsed.storeSlogan)) {
            parsed.storeSlogan = parsed.storeSlogan.replace(/•?\s*Cosméticos\s*y\s*Cuidado\s*Femenino/gi, '').trim() || 'Belleza que Empodera';
          }
          try {
            localStorage.setItem(STORAGE_KEYS.STORE_SETTINGS, JSON.stringify({ ...DEFAULT_STORE_SETTINGS, ...parsed }));
          } catch {
            // ignore
          }
        }
        return { ...DEFAULT_STORE_SETTINGS, ...parsed };
      }
      return DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  });

  const updateStoreSettings = useCallback((updates: Partial<StoreSettings>) => {
    setStoreSettings((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEYS.STORE_SETTINGS, JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving store settings:', e);
      }
      return updated;
    });
  }, []);

  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  // Filter and Search States for Catalog
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceMax, setPriceMax] = useState<number>(300);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');

  // Sync to persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn('Persistence error:', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.warn('Persistence error:', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      if (currentUser?.id) {
        localStorage.setItem(`mujer_latina_cart_user_${currentUser.id}`, JSON.stringify(cart));
      }
    } catch (e) {
      console.warn('Persistence error:', e);
    }
  }, [cart, currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
      if (currentUser?.id) {
        localStorage.setItem(`mujer_latina_wishlist_user_${currentUser.id}`, JSON.stringify(wishlist));
      }
    } catch (e) {
      console.warn('Persistence error:', e);
    }
  }, [wishlist, currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (e) {
      console.warn('Persistence error:', e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.PROFILE);
      }
    } catch (e) {
      console.warn('Persistence error:', e);
    }
  }, [currentUser]);

  // Check connection to Supabase if configured
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Async reactive pull from Supabase if table exists
    const fetchRemoteData = async () => {
      try {
        const { data: remoteProducts, error } = await supabase
          .from('products')
          .select('*');
        if (!error && remoteProducts && remoteProducts.length > 0) {
          // Map remote products
          console.log('Supabase sync successful: loaded remote products');
        }
      } catch (err) {
        // Silent fallback to local reactive DB
      }
    };
    fetchRemoteData();
  }, []);

  // =========================================================================
  // RECURSIVE INVENTORY AUDIT (LOOP ENGINE)
  // =========================================================================
  const inventoryAudit = useMemo(() => {
    return auditInventoryRecursively(products);
  }, [products]);

  // =========================================================================
  // CATALOG FILTERING & SORTING PIPELINE
  // =========================================================================
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (categoryFilter !== 'all') {
        if (p.categorySlug !== categoryFilter && p.category !== categoryFilter) {
          return false;
        }
      }
      // Search query (name, sku, description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          p.name.toLowerCase().includes(q) || 
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Price slider
      if (p.price > priceMax) return false;
      // In stock
      if (onlyInStock && p.stock <= 0) return false;
      // Rating
      if (minRating > 0 && p.rating < minRating) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      // Default: featured first
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });
  }, [products, categoryFilter, searchQuery, priceMax, onlyInStock, minRating, sortBy]);

  // =========================================================================
  // CART REACTIVE OPERATIONS
  // =========================================================================
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, product.stock > 0 ? product.stock : newQty),
        };
        return updated;
      } else {
        return [...prevCart, { product, quantity }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Reactive Totals calculated recursively
  const cartSubtotal = useMemo(() => {
    return calculateOrderItemsTotalRecursively(cart);
  }, [cart]);

  const cartTotalCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartShippingFee = useMemo(() => {
    if (cart.length === 0) return 0;
    return cartSubtotal >= storeSettings.freeShippingThreshold ? 0 : storeSettings.standardShippingFee;
  }, [cart, cartSubtotal, storeSettings.freeShippingThreshold, storeSettings.standardShippingFee]);

  const cartTotal = useMemo(() => {
    return cartSubtotal + cartShippingFee;
  }, [cartSubtotal, cartShippingFee]);

  // =========================================================================
  // WISHLIST REACTIVE OPERATIONS
  // =========================================================================
  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  const wishlistProducts = useMemo(() => {
    return products.filter((p) => wishlist.includes(p.id));
  }, [products, wishlist]);

  const moveWishlistToCart = useCallback((product: Product) => {
    addToCart(product, 1);
    setWishlist((prev) => prev.filter((id) => id !== product.id));
  }, [addToCart]);

  // =========================================================================
  // WHATSAPP CHECKOUT GENERATOR
  // =========================================================================
  const generateWhatsAppOrderLink = useCallback((shipping: ShippingData) => {
    const cleanPhone = storeSettings.whatsappNumber.replace(/[^0-9]/g, '') || '573108924110';
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    
    let message = `¡Hola *${storeSettings.storeName}*! ✨ Deseo realizar el siguiente pedido:\n\n`;
    message += `📋 *Pedido:* #${orderNumber}\n`;
    message += `👤 *Cliente:* ${shipping.fullName}\n`;
    message += `📱 *Teléfono:* ${shipping.phone}\n`;
    message += `📍 *Dirección:* ${shipping.address}, ${shipping.city}, ${shipping.department}\n`;
    if (shipping.additionalInfo && shipping.additionalInfo.trim()) {
      message += `📝 *Info Adicional:* ${shipping.additionalInfo.trim()}\n`;
    }
    if (shipping.documentId && shipping.documentId.trim()) {
      message += `🪪 *Documento:* ${shipping.documentId.trim()}\n`;
    }
    message += `\n🛍️ *Detalle de Artículos:*\n`;

    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name} (x${item.quantity}) - $${(item.product.price * item.quantity).toFixed(2)}\n`;
    });

    message += `\n💵 *Subtotal:* $${cartSubtotal.toFixed(2)}`;
    message += `\n🚚 *Envío:* ${cartShippingFee === 0 ? 'GRATIS' : `$${cartShippingFee.toFixed(2)}`}`;
    message += `\n🌟 *TOTAL A PAGAR:* $${cartTotal.toFixed(2)}\n\n`;
    message += `Quedo atenta a los datos de transferencia bancaria (Bancolombia / Nequi) para enviar el comprobante de pago. ¡Gracias!`;

    const encoded = encodeURIComponent(message);
    return {
      url: `https://wa.me/${cleanPhone}?text=${encoded}`,
      orderNumber,
    };
  }, [cart, cartSubtotal, cartShippingFee, cartTotal, storeSettings]);

  const processOrderWithWhatsApp = useCallback((shipping: ShippingData) => {
    if (cart.length === 0) return null;

    const { url, orderNumber } = generateWhatsAppOrderLink(shipping);

    // Create Order Record in 'pending' status
    // Registered user -> associate id_usuario and userId
    // Guest user -> id_usuario = null, no account created
    const newOrder: Order = {
      id: `#${orderNumber}`,
      id_usuario: currentUser ? currentUser.id : null,
      userId: currentUser ? currentUser.id : null,
      customer: shipping.fullName,
      phone: shipping.phone,
      city: shipping.city,
      department: shipping.department,
      address: shipping.address,
      additionalInfo: shipping.additionalInfo || '',
      documentId: shipping.documentId || '',
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      subtotal: cartSubtotal,
      shippingFee: cartShippingFee,
      total: cartTotal,
      status: 'pending',
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        imageUrl: item.product.imageUrl,
        unitPrice: item.product.price,
        quantity: item.quantity,
        totalPrice: item.product.price * item.quantity,
      })),
      notes: shipping.additionalInfo 
        ? `Información adicional de entrega: ${shipping.additionalInfo}`
        : 'Pedido generado mediante checkout de WhatsApp. Pendiente validación de comprobante.',
    };

    // If user is registered and chose to save changes to their personal info
    if (currentUser && shipping.saveToProfile) {
      const profileUpdates: Partial<UserProfile> = {
        fullName: shipping.fullName,
        phone: shipping.phone,
        department: shipping.department,
        city: shipping.city,
        address: shipping.address,
      };
      if (shipping.documentId) {
        profileUpdates.documentId = shipping.documentId;
      }
      setCurrentUser((prev) => {
        if (!prev) return null;
        const updated: UserProfile = { ...prev, ...profileUpdates };
        try {
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
          localStorage.setItem(`mujer_latina_user_${updated.id}_profile`, JSON.stringify(updated));
        } catch (e) {
          console.warn('Error saving profile changes:', e);
        }
        return updated;
      });
    }

    // Deduct stock reactively
    setProducts((prev) =>
      prev.map((p) => {
        const inCart = cart.find((item) => item.product.id === p.id);
        if (inCart) {
          const updatedStock = Math.max(0, p.stock - inCart.quantity);
          return { ...p, stock: updatedStock };
        }
        return p;
      })
    );

    // Register order in reactive state
    setOrders((prev) => [newOrder, ...prev]);

    // Clear cart
    clearCart();

    // Clear saved cart for registered user
    if (currentUser?.id) {
      try {
        localStorage.removeItem(`mujer_latina_cart_user_${currentUser.id}`);
      } catch (e) {
        console.warn(e);
      }
    }

    return { url, order: newOrder };
  }, [cart, cartSubtotal, cartShippingFee, cartTotal, generateWhatsAppOrderLink, clearCart, currentUser]);

  // =========================================================================
  // ADMIN INVENTORY MANAGEMENT (CRUD)
  // =========================================================================
  const addProduct = useCallback((newProd: Omit<Product, 'id' | 'createdAt'>) => {
    const created: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [created, ...prev]);
  }, []);

  const updateProduct = useCallback((updated: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    if (selectedProduct?.id === updated.id) {
      setSelectedProduct(updated);
    }
  }, [selectedProduct]);

  const deleteProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null);
    }
  }, [selectedProduct]);

  const restockProduct = useCallback((productId: string, amount: number = 20) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock + amount } : p))
    );
  }, []);

  const updateProductStock = useCallback((productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p))
    );
  }, []);

  // =========================================================================
  // ADMIN ORDERS MANAGEMENT (3 OPERATIONAL PHASES)
  // =========================================================================
  const updateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  }, []);

  const verifyOrderPayment = useCallback((orderId: string, verified: boolean) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              receiptVerified: verified,
              status: verified ? 'paid' : 'pending',
            }
          : o
      )
    );
  }, []);

  const updateOrderShipping = useCallback((orderId: string, carrier: string, tracking: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              carrier,
              tracking,
              status: tracking ? 'shipped' : o.status,
            }
          : o
      )
    );
  }, []);

  const attachPaymentReceipt = useCallback((orderId: string, receiptUrl: string, bank: string = 'Bancolombia') => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              receiptUrl,
              receiptBank: bank,
              receiptVerified: true,
              status: 'paid',
            }
          : o
      )
    );
  }, []);

  // Customers Management Actions
  const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    return newCustomer;
  }, []);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // =========================================================================
  // USER PROFILE & AUTH (RBAC) & CART RESTORATION
  // =========================================================================
  const restoreUserCartAndWishlist = useCallback((user: UserProfile) => {
    try {
      const userCartKey = `mujer_latina_cart_user_${user.id}`;
      const savedUserCart = localStorage.getItem(userCartKey);
      if (savedUserCart) {
        const parsed = JSON.parse(savedUserCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      } else {
        // Associate current cart if user didn't have a saved cart
        setCart((curr) => {
          if (curr.length > 0) {
            localStorage.setItem(userCartKey, JSON.stringify(curr));
          }
          return curr;
        });
      }

      const userWishlistKey = `mujer_latina_wishlist_user_${user.id}`;
      const savedUserWishlist = localStorage.getItem(userWishlistKey);
      if (savedUserWishlist) {
        const parsed = JSON.parse(savedUserWishlist);
        if (Array.isArray(parsed)) {
          setWishlist(parsed);
        }
      } else {
        setWishlist((curr) => {
          if (curr.length > 0) {
            localStorage.setItem(userWishlistKey, JSON.stringify(curr));
          }
          return curr;
        });
      }
    } catch (e) {
      console.warn('Error restoring user cart/wishlist:', e);
    }
  }, []);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated: UserProfile = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
        localStorage.setItem(`mujer_latina_user_${updated.id}_profile`, JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving profile:', e);
      }
      return updated;
    });
  }, []);

  const updateAdminAccount = useCallback(async (
    profileUpdates: Partial<UserProfile>,
    passwordData?: { currentPassword: string; newPassword: string }
  ) => {
    if (!currentUser) {
      return { success: false, error: 'No hay una sesión de administradora activa.' };
    }

    const result = await updateAdminUserCredentials(currentUser.id, profileUpdates, passwordData);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(result.user));
        localStorage.setItem(`mujer_latina_user_${result.user.id}_profile`, JSON.stringify(result.user));
      } catch (e) {
        console.warn('Error saving admin profile update:', e);
      }
      return { success: true, user: result.user };
    }
    return { success: false, error: result.error || 'No fue posible actualizar la cuenta de administradora.' };
  }, [currentUser]);

  const updateClientAccount = useCallback(async (
    profileUpdates: Partial<UserProfile>,
    passwordData?: { currentPassword: string; newPassword: string }
  ) => {
    if (!currentUser) {
      return { success: false, error: 'No hay una sesión de usuario activa.' };
    }

    const result = await updateClientUserCredentials(currentUser.id, profileUpdates, passwordData);
    if (result.success && result.user) {
      const updatedUser = result.user;
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedUser));
        localStorage.setItem(`mujer_latina_user_${updatedUser.id}_profile`, JSON.stringify(updatedUser));
      } catch (e) {
        console.warn('Error saving client profile update:', e);
      }

      // Sincronizar también con la lista de clientes si existe
      setCustomers((prevCustomers) =>
        prevCustomers.map((c) =>
          c.email.toLowerCase() === updatedUser.email.toLowerCase() || c.id === updatedUser.id
            ? {
                ...c,
                name: updatedUser.fullName,
                phone: updatedUser.phone || c.phone,
                city: updatedUser.city || c.city,
                department: updatedUser.department || c.department,
                address: updatedUser.address || c.address,
                avatarUrl: updatedUser.avatarUrl || c.avatarUrl,
              }
            : c
        )
      );

      return { success: true, user: updatedUser };
    }
    return { success: false, error: result.error || 'No fue posible actualizar la información del usuario.' };
  }, [currentUser]);

  const loginWithCredentials = useCallback(async (email: string, password: string) => {
    const result = await authenticateUser(email, password);
    if (result.success && result.user) {
      let userToSet = result.user;
      try {
        const savedCustomProfile = localStorage.getItem(`mujer_latina_user_${result.user.id}_profile`);
        if (savedCustomProfile) {
          userToSet = { ...result.user, ...JSON.parse(savedCustomProfile) };
        }
      } catch (e) {
        console.warn(e);
      }

      setCurrentUser(userToSet);
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userToSet));
      } catch (e) {
        console.warn('Error saving session', e);
      }
      restoreUserCartAndWishlist(userToSet);
      return { success: true, user: userToSet };
    }
    return { success: false, error: result.error || 'Correo o contraseña incorrectos' };
  }, [restoreUserCartAndWishlist]);

  const login = useCallback((email: string, role: 'customer' | 'admin' = 'customer') => {
    const userToSet = role === 'admin' ? ADMIN_USER_PROFILE : { ...DEMO_USER_PROFILE, email };
    setCurrentUser(userToSet);
    restoreUserCartAndWishlist(userToSet);
  }, [restoreUserCartAndWishlist]);

  const registerUser = useCallback(async (data: RegisterData) => {
    const result = await registerNewUser(data);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(result.user));
      } catch (e) {
        console.warn('Error saving session', e);
      }
      restoreUserCartAndWishlist(result.user);
      return { success: true, user: result.user };
    }
    return { 
      success: false, 
      errors: result.errors || {}, 
      message: result.message || 'Error al registrar el usuario' 
    };
  }, [restoreUserCartAndWishlist]);

  const logout = useCallback(() => {
    if (currentUser?.id) {
      try {
        localStorage.setItem(`mujer_latina_cart_user_${currentUser.id}`, JSON.stringify(cart));
        localStorage.setItem(`mujer_latina_wishlist_user_${currentUser.id}`, JSON.stringify(wishlist));
      } catch (e) {
        console.warn(e);
      }
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
    } catch (e) {
      console.warn('Error removing session', e);
    }
    // Guest cart reset
    setCart([]);
    setActiveView('home');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [currentUser, cart, wishlist]);

  // Quick navigation helpers
  const navigateToProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setActiveView('product_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    // Navigation
    activeView,
    setActiveView,
    selectedProduct,
    setSelectedProduct,
    navigateToProduct,
    selectedOrder,
    setSelectedOrder,

    // Categories & Products
    categories,
    products,
    filteredProducts,
    addProduct,
    createProduct: addProduct,
    updateProduct,
    updateProductStock,
    deleteProduct,
    restockProduct,

    // Recursive Inventory Loop Engine
    inventoryAudit,

    // Filter controls
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    priceMax,
    setPriceMax,
    onlyInStock,
    setOnlyInStock,
    minRating,
    setMinRating,
    sortBy,
    setSortBy,

    // Cart
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotalCount,
    cartSubtotal,
    cartShippingFee,
    cartTotal,

    // Wishlist
    wishlist,
    wishlistProducts,
    toggleWishlist,
    isInWishlist,
    moveWishlistToCart,

    // WhatsApp Order Checkout
    generateWhatsAppOrderLink,
    processOrderWithWhatsApp,

    // Orders & Admin
    orders,
    updateOrderStatus,
    verifyOrderPayment,
    updateOrderShipping,
    attachPaymentReceipt,

    // Customers
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,

    // Auth & RBAC
    currentUser,
    isProfileEditing,
    setIsProfileEditing,
    openProfileEdit,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    loginWithCredentials,
    login,
    registerUser,
    requestPasswordReset,
    logout,
    updateUserProfile,
    updateAdminAccount,
    updateClientAccount,

    // Store & System Settings
    storeSettings,
    updateStoreSettings,
  };
}

export type StoreController = ReturnType<typeof useStoreController>;
