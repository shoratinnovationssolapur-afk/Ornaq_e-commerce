import { useState } from "react";
import api from "../../services/api";

export default function ProductManagement({ products, refreshProducts }) {
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", category: "Silk", fabric: "", color: "", price: "", stock: "", featured: false
  });
  const [files, setFiles] = useState([]);

  const createProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      files.forEach((file) => fd.append("images", file));
      const uploadRes = await api.post("/uploads/products", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), images: uploadRes.data };
      await api.post("/products", payload);
      setForm({ name: "", description: "", category: "Silk", fabric: "", color: "", price: "", stock: "", featured: false });
      setFiles([]);
      setShowAddForm(false);
      refreshProducts();
    } catch (err) {
      alert("Error creating product: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const updateStock = async (id, stock) => {
    await api.patch(`/products/${id}/stock`, { stock: Number(stock) });
    refreshProducts();
  };

  const quickAdjustStock = async (id, delta) => {
    await api.patch(`/products/${id}/stock/adjust`, { delta });
    refreshProducts();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900">Products & Inventory</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          {showAddForm ? "Cancel" : "Add New Product"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={createProduct} className="grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 md:grid-cols-2">
          <div className="md:col-span-2 text-sm font-bold text-zinc-400 uppercase tracking-tight">New Product Details</div>
          <input required className="rounded-lg border bg-white p-2.5" placeholder="Product Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <select className="rounded-lg border bg-white p-2.5" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            {["Silk", "Cotton", "Wedding", "Casual"].map((category) => <option key={category}>{category}</option>)}
          </select>
          <input required className="rounded-lg border bg-white p-2.5" placeholder="Fabric (e.g. Banarasi)" value={form.fabric} onChange={(e) => setForm((f) => ({ ...f, fabric: e.target.value }))} />
          <input required className="rounded-lg border bg-white p-2.5" placeholder="Color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} />
          <input required className="rounded-lg border bg-white p-2.5" type="number" placeholder="Price (Rs)" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          <input required className="rounded-lg border bg-white p-2.5" type="number" placeholder="Initial Stock" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
          <textarea required className="rounded-lg border bg-white p-2.5 md:col-span-2" placeholder="Product Description" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Product Images</label>
            <input className="mt-1 block w-full text-sm" type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" className="h-4 w-4 rounded border-zinc-300" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
            Show on Home Page (Featured)
          </label>
          <button disabled={submitting} className="md:col-span-2 rounded-lg bg-brand-700 py-3 font-bold text-white shadow-lg shadow-brand-100 hover:bg-brand-800 disabled:opacity-50">
            {submitting ? "Uploading & Saving..." : "Publish Product"}
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs font-bold uppercase text-zinc-500">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4 text-center">Stock Management</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products.map((p) => (
              <tr key={p._id} className="group hover:bg-zinc-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]?.url} className="h-10 w-10 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold text-zinc-900">{p.name}</p>
                      <p className="text-xs text-zinc-400">ID: {p._id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-600">{p.category}</td>
                <td className="px-6 py-4 font-semibold">Rs. {p.price}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex items-center rounded-lg border border-zinc-200 bg-white">
                      <button onClick={() => quickAdjustStock(p._id, -1)} className="px-3 py-1 hover:bg-zinc-50 text-zinc-500">-</button>
                      <span className={`w-10 text-center font-bold ${p.stock < 5 ? "text-red-600" : "text-zinc-900"}`}>{p.stock}</span>
                      <button onClick={() => quickAdjustStock(p._id, 1)} className="px-3 py-1 hover:bg-zinc-50 text-zinc-500">+</button>
                    </div>
                    <input 
                      type="number" 
                      placeholder="Set"
                      className="w-16 rounded-lg border border-zinc-200 p-1 text-center text-xs focus:ring-1 focus:ring-brand-500 outline-none" 
                      onBlur={(e) => e.target.value && updateStock(p._id, e.target.value)} 
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
