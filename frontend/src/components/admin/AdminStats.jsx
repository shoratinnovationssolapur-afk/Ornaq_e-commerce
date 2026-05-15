export default function AdminStats({ dashboard }) {
  const cards = [
    {
      label: "Total Products",
      value: dashboard.totalProducts || 0,
      accent: "text-brand-800"
    },
    {
      label: "Total Orders",
      value: dashboard.totalOrders || 0,
      accent: "text-stone-900"
    },
    {
      label: "Low Stock Items",
      value: dashboard.lowStockCount || 0,
      accent: (dashboard.lowStockCount || 0) > 0 ? "text-amber-600" : "text-stone-900"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/40">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-400">{card.label}</p>
          <p className={`mt-3 text-4xl font-semibold ${card.accent}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
