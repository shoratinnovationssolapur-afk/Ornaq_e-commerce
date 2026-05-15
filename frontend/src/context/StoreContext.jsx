import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";
import { useNotification } from "./NotificationContext";

const StoreContext = createContext(null);
const RECENTLY_VIEWED_KEY = "ornac_recently_viewed";

const readRecentlyViewed = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
  } catch {
    return [];
  }
};

export const StoreProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState(() => readRecentlyViewed());
  const isAuthed = Boolean(user);

  useEffect(() => {
    if (!isAuthed) {
      setCart([]);
      setWishlist([]);
      return;
    }
    api
      .get("/cart")
      .then((res) =>
        setCart(
          (res.data.items || []).map((item) => ({
            ...item.product,
            qty: item.qty,
            selectedColor: item.selectedColor || item.product?.color || ""
          }))
        )
      )
      .catch(() => {});
    api
      .get("/wishlist")
      .then((res) => setWishlist((res.data.products || []).filter(Boolean)))
      .catch(() => {});
  }, [isAuthed]);

  useEffect(() => {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const addToCart = useCallback(async (product, qty = 1, selectedColor = "") => {
    const matcher = (item) => item._id === product._id && String(item.selectedColor || "") === String(selectedColor || "");
    const nextQty = (cart.find(matcher)?.qty || 0) + qty;
    if (isAuthed) {
      await api.post("/cart", { productId: product._id, qty: nextQty, selectedColor }).catch(() => {});
    }
    setCart((prev) => {
      const found = prev.find(matcher);
      return found
        ? prev.map((item) => (matcher(item) ? { ...item, qty: item.qty + qty } : item))
        : [...prev, { ...product, qty, selectedColor: selectedColor || product.color || product.colors?.[0] || "" }];
    });
    showToast({
      title: "Added to cart",
      message: `${product.name}${selectedColor ? ` • ${selectedColor}` : ""} is now in your bag.`,
      tone: "success"
    });
  }, [cart, isAuthed, showToast]);

  const toggleWishlist = useCallback(async (product) => {
    const alreadySaved = wishlist.some((item) => item._id === product._id);
    if (isAuthed) {
      await api.post("/wishlist/toggle", { productId: product._id }).catch(() => {});
    }
    setWishlist((prev) =>
      prev.some((item) => item._id === product._id) ? prev.filter((item) => item._id !== product._id) : [...prev, product]
    );
    showToast({
      title: alreadySaved ? "Removed from wishlist" : "Saved to wishlist",
      message: product.name,
      tone: "info"
    });
  }, [isAuthed, showToast, wishlist]);

  const clearCart = useCallback(async () => {
    if (isAuthed) {
      await api.delete("/cart").catch(() => {});
    }
    setCart([]);
  }, [isAuthed]);

  const removeFromCart = useCallback(async (productId, selectedColor = "") => {
    if (isAuthed) {
      await api.delete(`/cart/${productId}`, { params: selectedColor ? { color: selectedColor } : {} }).catch(() => {});
    }
    setCart((prev) =>
      prev.filter(
        (item) => !(item._id === productId && String(item.selectedColor || "") === String(selectedColor || ""))
      )
    );
    showToast({
      title: "Removed from cart",
      message: "The item was removed from your bag.",
      tone: "warning"
    });
  }, [isAuthed, showToast]);

  const updateCartQuantity = useCallback(async (productId, qty, selectedColor = "") => {
    if (qty <= 0) {
      return removeFromCart(productId, selectedColor);
    }

    if (isAuthed) {
      await api.post("/cart", { productId, qty, selectedColor }).catch(() => {});
    }

    setCart((prev) =>
      prev.map((item) =>
        item._id === productId && String(item.selectedColor || "") === String(selectedColor || "") ? { ...item, qty } : item
      )
    );
  }, [isAuthed, removeFromCart]);

  const markViewed = useCallback((product) =>
    setRecentlyViewed((prev) => [product, ...prev.filter((item) => item._id !== product._id)].slice(0, 10)), []);

  const cartSummary = useMemo(
    () => ({
      subtotal: cart.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.qty, 0),
      quantity: cart.reduce((sum, item) => sum + item.qty, 0)
    }),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      recentlyViewed,
      cartSummary,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      toggleWishlist,
      markViewed,
      clearCart
    }),
    [cart, wishlist, recentlyViewed, cartSummary]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => useContext(StoreContext);
