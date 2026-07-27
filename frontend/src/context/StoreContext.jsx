import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { getOfferPrice } from "../utils/catalog";
import { useAuth } from "./AuthContext";
import { useNotification } from "./NotificationContext";

const StoreContext = createContext(null);
const CART_KEY = "ornac_guest_cart";
const RECENTLY_VIEWED_KEY = "ornac_recently_viewed";
const WISHLIST_KEY = "ornac_guest_wishlist";

const readStoredList = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

export const StoreProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [cart, setCart] = useState(() => readStoredList(CART_KEY));
  const [wishlist, setWishlist] = useState(() => readStoredList(WISHLIST_KEY));
  const [recentlyViewed, setRecentlyViewed] = useState(() => readStoredList(RECENTLY_VIEWED_KEY));
  const isAuthed = Boolean(user);

  useEffect(() => {
    if (!isAuthed) return;

    api
      .get("/cart")
      .then((res) =>
        setCart(
          (res.data.items || []).map((item) => ({
            ...item.product,
            qty: item.qty,
            selectedColor: item.selectedColor || item.product?.color || "",
            selectedSize: item.selectedSize || ""
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
    if (!isAuthed) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, isAuthed]);

  useEffect(() => {
    if (!isAuthed) localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, isAuthed]);

  useEffect(() => {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const addToCart = useCallback(async (product, qty = 1, selectedColor = "", selectedSize = "") => {
    const normalizedColor = selectedColor || product.color || product.colors?.[0] || "";
    const normalizedSize = selectedSize || "";
    const matcher = (item) =>
      item._id === product._id &&
      String(item.selectedColor || "") === String(normalizedColor || "") &&
      String(item.selectedSize || "") === String(normalizedSize || "");
    const nextQty = (cart.find(matcher)?.qty || 0) + qty;
    if (isAuthed) {
      await api
        .post("/cart", { productId: product._id, qty: nextQty, selectedColor: normalizedColor, selectedSize: normalizedSize })
        .catch(() => {});
    }
    setCart((prev) => {
      const found = prev.find(matcher);
      return found
        ? prev.map((item) => (matcher(item) ? { ...item, qty: item.qty + qty } : item))
        : [...prev, { ...product, qty, selectedColor: normalizedColor, selectedSize: normalizedSize }];
    });
    showToast({
      title: "Added to cart",
      message: `${product.name}${normalizedColor ? ` - ${normalizedColor}` : ""}${normalizedSize ? ` • ${normalizedSize}` : ""} is now in your bag.`,
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

  const removeOrderedItemsFromCart = useCallback((orderedItems = []) => {
    setCart((prev) =>
      prev
        .map((cartItem) => {
          const orderedItem = orderedItems.find(
            (item) =>
              String(item.product || item._id || "") === String(cartItem._id || "") &&
              String(item.selectedColor || "") === String(cartItem.selectedColor || "") &&
              String(item.selectedSize || "") === String(cartItem.selectedSize || "")
          );

          if (!orderedItem) return cartItem;

          return {
            ...cartItem,
            qty: Math.max(0, Number(cartItem.qty || 0) - Number(orderedItem.qty || 0))
          };
        })
        .filter((item) => Number(item.qty || 0) > 0)
    );
  }, []);

  const removeFromCart = useCallback(async (productId, selectedColor = "", selectedSize = "") => {
    if (isAuthed) {
      await api
        .delete(`/cart/${productId}`, { params: { ...(selectedColor ? { color: selectedColor } : {}), ...(selectedSize ? { size: selectedSize } : {}) } })
        .catch(() => {});
    }
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item._id === productId &&
            String(item.selectedColor || "") === String(selectedColor || "") &&
            String(item.selectedSize || "") === String(selectedSize || ""))
      )
    );
    showToast({
      title: "Removed from cart",
      message: "The item was removed from your bag.",
      tone: "warning"
    });
  }, [isAuthed, showToast]);

  const updateCartQuantity = useCallback(async (productId, qty, selectedColor = "", selectedSize = "") => {
    if (qty <= 0) {
      return removeFromCart(productId, selectedColor, selectedSize);
    }

    if (isAuthed) {
      await api.post("/cart", { productId, qty, selectedColor, selectedSize }).catch(() => {});
    }

    setCart((prev) =>
      prev.map((item) =>
        item._id === productId &&
        String(item.selectedColor || "") === String(selectedColor || "") &&
        String(item.selectedSize || "") === String(selectedSize || "")
          ? { ...item, qty }
          : item
      )
    );
  }, [isAuthed, removeFromCart]);

  const markViewed = useCallback((product) =>
    setRecentlyViewed((prev) => [product, ...prev.filter((item) => item._id !== product._id)].slice(0, 10)), []);

  const cartSummary = useMemo(
    () => ({
      subtotal: cart.reduce((sum, item) => sum + getOfferPrice(item) * item.qty, 0),
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
      clearCart,
      removeOrderedItemsFromCart
    }),
    [cart, wishlist, recentlyViewed, cartSummary, addToCart, updateCartQuantity, removeFromCart, toggleWishlist, markViewed, clearCart, removeOrderedItemsFromCart]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => useContext(StoreContext);
