import { cleanFilters, mergeCategories, sortOptions } from "../utils/catalog";

export default function ShopFilters({ filters, metadata, onChange, onReset }) {
  const categories = mergeCategories(metadata.categories);

  return (
    <aside className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/40 sm:rounded-xl sm:p-5 md:rounded-2xl md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-stone-400 sm:text-xs">Refine collection</p>
          <h2 className="mt-2 text-lg font-semibold text-stone-900 sm:text-xl md:text-2xl">Filters</h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-brand-700 transition hover:text-brand-800 sm:text-sm"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 space-y-5 sm:mt-5 sm:space-y-5 md:mt-6 md:space-y-6">
        <div className="rounded-[2rem] border border-stone-200 bg-stone-50 p-4 shadow-sm shadow-stone-200/50">
          <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 sm:text-xs">Search</label>
          <input
            type="search"
            value={filters.searchQuery}
            onChange={(event) => onChange("searchQuery", event.target.value)}
            placeholder="Search by name, fabric, code"
            className="mt-3 w-full rounded-[1.75rem] border border-stone-200 bg-white px-4 py-3 text-xs outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100 sm:px-4 sm:py-3 sm:text-sm"
          />
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-stone-50 p-4 shadow-sm shadow-stone-200/50">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 sm:text-xs">Category</label>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">Tap to refine</span>
          </div>
          <select
            value={filters.category}
            onChange={(event) => onChange("category", event.target.value)}
            className="mt-3 w-full rounded-[1.75rem] border border-stone-200 bg-white px-4 py-3 text-xs outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100 sm:px-4 sm:py-3 sm:text-sm"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[2rem] border border-stone-200 bg-stone-50 p-4 shadow-sm shadow-stone-200/50">
            <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 sm:text-xs">Fabric</label>
            <select
              value={filters.fabric}
              onChange={(event) => onChange("fabric", event.target.value)}
              className="mt-3 w-full rounded-[1.75rem] border border-stone-200 bg-white px-4 py-3 text-xs outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100 sm:px-4 sm:py-3 sm:text-sm"
            >
              <option value="">All fabrics</option>
              {(metadata.fabrics || []).map((fabric) => (
                <option key={fabric} value={fabric}>
                  {fabric}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-stone-50 p-4 shadow-sm shadow-stone-200/50">
            <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 sm:text-xs">Color</label>
            <select
              value={filters.color}
              onChange={(event) => onChange("color", event.target.value)}
              className="mt-3 w-full rounded-[1.75rem] border border-stone-200 bg-white px-4 py-3 text-xs outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100 sm:px-4 sm:py-3 sm:text-sm"
            >
              <option value="">All colors</option>
              {(metadata.colors || []).map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-stone-50 p-4 shadow-sm shadow-stone-200/50">
          <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 sm:text-xs">Price range</label>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              type="number"
              min="0"
              value={filters.minPrice}
              onChange={(event) => onChange("minPrice", event.target.value)}
              placeholder="Min"
              className="w-full rounded-[1.75rem] border border-stone-200 bg-white px-4 py-3 text-xs outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100 sm:text-sm"
            />
            <input
              type="number"
              min="0"
              value={filters.maxPrice}
              onChange={(event) => onChange("maxPrice", event.target.value)}
              placeholder="Max"
              className="w-full rounded-[1.75rem] border border-stone-200 bg-white px-4 py-3 text-xs outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100 sm:text-sm"
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-stone-50 p-4 shadow-sm shadow-stone-200/50">
          <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 sm:text-xs">Sort by</label>
          <select
            value={filters.sort}
            onChange={(event) => onChange("sort", event.target.value)}
            className="mt-3 w-full rounded-[1.75rem] border border-stone-200 bg-white px-4 py-3 text-xs outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100 sm:px-4 sm:py-3 sm:text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-[1.75rem] border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-100 sm:text-sm">
          <input
            type="checkbox"
            checked={filters.isNewArrival === "true"}
            onChange={(event) => onChange("isNewArrival", event.target.checked ? "true" : "")}
            className="h-4 w-4 rounded border-stone-300 text-brand-700 focus:ring-brand-300"
          />
          <span>Show only new arrivals</span>
        </label>
      </div>

      <div className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-xs text-stone-600 sm:mt-5 sm:rounded-xl sm:px-4 sm:py-3 md:rounded-2xl">
        Active query: <span className="font-semibold text-stone-900">{Object.keys(cleanFilters(filters)).length}</span> filter(s)
      </div>
    </aside>
  );
}
