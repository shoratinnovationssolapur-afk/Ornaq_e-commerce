import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { formatCurrency, getProductImage } from "../utils/catalog";

export default function CartPage() {
  const { cart, cartSummary, removeFromCart, updateCartQuantity } = useStore();
  const shipping = cartSummary.subtotal >= 999 ? 0 : 50;
  const total = cartSummary.subtotal + shipping;

  return (
    <div className="min-h-screen bg-[#fffdf9] pb-20">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-16">
        <header className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-700">Shopping Bag</p>
          <h1 className="mt-3 text-3xl font-black text-stone-900 sm:text-5xl">Your Selection</h1>
          <p className="mt-4 max-w-2xl text-sm font-medium text-stone-500 sm:text-base">
            Review your handpicked sarees. We ensure safe handling and premium packaging for every order.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
          <section className="space-y-6">
            {cart.length === 0 && (
              <div className="rounded-[3rem] border border-dashed border-stone-200 bg-white px-8 py-20 text-center shadow-xl shadow-stone-100">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-stone-50">
                  <svg className="h-10 w-10 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-stone-900">Your bag is empty</h2>
                <p className="mt-3 text-stone-500">Discover our latest silk and paithani collections.</p>
                <Link to="/shop" className="btn-primary mt-8 inline-flex px-10">
                  Go to Shop
                </Link>
              </div>
            )}

            {cart.map((item) => (
              <article key={`${item._id}-${item.selectedColor || "default"}`} className="group relative flex gap-6 rounded-[2.5rem] border border-stone-100 bg-white p-6 shadow-xl shadow-stone-100 transition-all hover:shadow-stone-200/50">
                <Link to={`/product/${item.slug}`} className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-2xl bg-stone-50 sm:w-32">
                  <img src={getProductImage(item)} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </Link>
                
                <div className="flex flex-1 flex-col py-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="line-clamp-1 text-base font-black text-stone-900 sm:text-lg">{item.name}</h3>
                      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-stone-400">{item.fabric} • {item.selectedColor || item.color}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item._id, item.selectedColor)}
                      className="rounded-full p-2 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-500"
                      aria-label="Remove item"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-4">
                    <div className="flex items-center rounded-xl bg-stone-50 p-1">
                      <button 
                        type="button" 
                        onClick={() => updateCartQuantity(item._id, item.qty - 1, item.selectedColor)} 
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-black transition-colors hover:bg-white hover:text-brand-700"
                      >-</button>
                      <span className="min-w-[40px] text-center text-sm font-black text-stone-900">{item.qty}</span>
                      <button 
                        type="button" 
                        onClick={() => updateCartQuantity(item._id, item.qty + 1, item.selectedColor)} 
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-black transition-colors hover:bg-white hover:text-brand-700"
                      >+</button>
                    </div>
                    <p className="text-lg font-black text-stone-900">{formatCurrency((item.discountPrice || item.price) * item.qty)}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="sticky top-28 h-fit space-y-6">
            <div className="rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-2xl shadow-stone-200/50">
              <h2 className="text-xl font-black text-stone-900">Summary</h2>
              <div className="mt-8 space-y-4">
                <div className="flex justify-between text-sm font-medium text-stone-500">
                  <span>Subtotal ({cartSummary.quantity} items)</span>
                  <span className="text-stone-900">{formatCurrency(cartSummary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-stone-500">
                  <span>Shipping & Handling</span>
                  <span className={shipping === 0 ? "font-black text-emerald-600" : "text-stone-900"}>
                    {shipping === 0 ? "FREE" : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="border-t border-stone-100 pt-4 flex justify-between items-baseline">
                  <span className="text-lg font-black text-stone-900">Total</span>
                  <span className="text-2xl font-black text-brand-700">{formatCurrency(total)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <div className="mt-6 rounded-2xl bg-brand-50 p-4">
                  <p className="text-xs font-bold leading-relaxed text-brand-800">
                    Add {formatCurrency(999 - cartSummary.subtotal)} more to your bag to unlock <span className="font-black">FREE SHIPPING</span>.
                  </p>
                </div>
              )}

              <Link 
                to="/checkout" 
                className={`btn-primary mt-8 w-full py-4 text-base ${!cart.length && "pointer-events-none opacity-50"}`}
              >
                Checkout Securely
              </Link>
            </div>

            <div className="rounded-[2rem] bg-zinc-900 p-8 text-white">
              <p className="text-sm font-bold tracking-tight">Need assistance?</p>
              <p className="mt-2 text-xs font-medium text-zinc-400">Our support team is available 10 AM - 7 PM for sizing and fabric queries.</p>
              <Link to="/contact" className="mt-4 inline-block text-xs font-black uppercase tracking-widest text-brand-400 hover:text-brand-300 transition-colors underline underline-offset-4">Contact Support</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
