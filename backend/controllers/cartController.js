import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { getEffectivePrice } from "../utils/productUtils.js";

const populateCart = (query) => query.populate("items.product");

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

const serializeCart = (cart) => {
  const items = (cart?.items || [])
    .filter((item) => item.product)
    .map((item) => ({
      ...item.toObject?.(),
      selectedColor: item.selectedColor || item.product?.color || "",
      selectedSize: item.selectedSize || "",
      lineTotal: getEffectivePrice(item.product) * Number(item.qty || 0)
    }));

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.qty || 0), 0);

  return {
    user: cart?.user,
    items,
    subtotal,
    totalQuantity
  };
};

const findItem = (cart, productId, selectedColor, selectedSize) =>
  cart.items.find(
    (item) =>
      item.product.toString() === productId &&
      String(item.selectedColor || "") === String(selectedColor || "") &&
      String(item.selectedSize || "") === String(selectedSize || "")
  );

export const getCart = async (req, res) => {
  const cart = await populateCart(Cart.findOne({ user: req.user._id }));
  res.json(serializeCart(cart) || { user: req.user._id, items: [], subtotal: 0, totalQuantity: 0 });
};

export const upsertCartItem = async (req, res) => {
  const { productId, qty = 1, selectedColor = "", selectedSize = "" } = req.body;
  const normalizedQty = Math.max(1, Number(qty || 1));
  const normalizedColor = normalizeString(selectedColor);
  const normalizedSize = normalizeString(selectedSize);
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const item = findItem(cart, productId, normalizedColor, normalizedSize);
  const previousQty = item?.qty || 0;
  if (item) {
    item.qty = normalizedQty;
  } else {
    cart.items.push({ product: productId, qty: normalizedQty, selectedColor: normalizedColor, selectedSize: normalizedSize });
  }

  await cart.save();
  await Product.findByIdAndUpdate(productId, {
    $inc: { "analytics.cartAdds": Math.max(1, normalizedQty - previousQty) }
  });

  const populated = await populateCart(Cart.findOne({ user: req.user._id }));
  res.json(serializeCart(populated));
};

export const removeCartItem = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(204).send();
  const selectedColor = normalizeString(req.query.color || req.body?.selectedColor || "");
  const selectedSize = normalizeString(req.query.size || req.body?.selectedSize || "");
  cart.items = cart.items.filter(
    (item) =>
      item.product.toString() !== req.params.productId ||
      String(item.selectedColor || "") !== String(selectedColor) ||
      String(item.selectedSize || "") !== String(selectedSize)
  );
  await cart.save();
  const populated = await populateCart(Cart.findOne({ user: req.user._id }));
  res.json(serializeCart(populated));
};

export const clearCart = async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } }, { new: true });
  res.status(204).send();
};
