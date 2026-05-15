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

      <div className="mt-4 space-y-4 sm:mt-5 sm:space-y-5 md:mt-6 md:space-y-5">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 sm:text-xs">Search</label>
          <input
            type="search"
            value={filters.searchQuery}
            onChange={(event) => onChange("searchQuery", event.target.value)}
            placeholder="Search by saree name"
            className="mt-2 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs outline-none transition focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm md:rounded-2xl"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 sm:text-xs">Category</label>
          <select
            value={filters.category}
            onChange={(event) => onChange("category", event.target.value)}
            className="mt-2 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs outline-none transition focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm md:rounded-2xl"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 sm:text-xs">Fabric</label>
          <select
            value={filters.fabric}
            onChange={(event) => onChange("fabric", event.target.value)}
            className="mt-2 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs outline-none transition focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm md:rounded-2xl"
          >
            <option value="">All fabrics</option>
            {(metadata.fabrics || []).map((fabric) => (
              <option key={fabric} value={fabric}>
                {fabric}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 sm:text-xs">Color</label>
          <select
            value={filters.color}
            onChange={(event) => onChange("color", event.target.value)}
            className="mt-2 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs outline-none transition focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm md:rounded-2xl"
          >
            <option value="">All colors</option>
            {(metadata.colors || []).map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 sm:text-xs">Sort by</label>
          <select
            value={filters.sort}
            onChange={(event) => onChange("sort", event.target.value)}
            className="mt-2 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs outline-none transition focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm md:rounded-2xl"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 sm:text-xs">Min price</label>
            <input
              type="number"
              min="0"
              value={filters.minPrice}
              onChange={(event) => onChange("minPrice", event.target.value)}
              placeholder="1000"
              className="mt-2 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs outline-none transition focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm md:rounded-2xl"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 sm:text-xs">Max price</label>
            <input
              type="number"
              min="0"
              value={filters.maxPrice}
              onChange={(event) => onChange("maxPrice", event.target.value)}
              placeholder="5000"
              className="mt-2 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs outline-none transition focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm md:rounded-2xl"
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 transition hover:bg-stone-100 sm:rounded-xl sm:px-4 sm:gap-3">
          <input
            type="checkbox"
            checked={filters.isNewArrival === "true"}
            onChange={(event) => onChange("isNewArrival", event.target.checked ? "true" : "")}
            className="h-4 w-4 rounded border-stone-300 text-brand-700 focus:ring-brand-300"
          />
          <span className="text-xs font-medium text-stone-700 sm:text-sm">Show only new arrivals</span>
        </label>
      </div>

      <div className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-xs text-stone-600 sm:mt-5 sm:rounded-xl sm:px-4 sm:py-3 md:rounded-2xl">
        Active query: <span className="font-semibold text-stone-900">{Object.keys(cleanFilters(filters)).length}</span> filter(s)
      </div>
    </aside>
  );
}
