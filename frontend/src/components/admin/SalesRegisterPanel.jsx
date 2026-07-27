import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../../services/api";

const formatCell = (value) => {
  if (value === "" || value == null) {
    return "-";
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? value : value.toFixed(2);
  }

  return String(value);
};

const formatUpdatedAt = (value) => {
  if (!value) {
    return "Not generated yet";
  }

  return new Date(value).toLocaleString();
};

const getFileNameFromDisposition = (headerValue, fallback) => {
  const match = /filename="?(?<name>[^"]+)"?/i.exec(headerValue || "");
  return match?.groups?.name || fallback;
};

export default function SalesRegisterPanel({ salesRegister }) {
  const sheets = salesRegister?.sheets || [];
  const [activeSheet, setActiveSheet] = useState(sheets[0]?.key || "");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!sheets.some((sheet) => sheet.key === activeSheet)) {
      setActiveSheet(sheets[0]?.key || "");
    }
  }, [activeSheet, sheets]);

  const selectedSheet = sheets.find((sheet) => sheet.key === activeSheet) || sheets[0];

  const handleDownload = async () => {
    setDownloading(true);

    try {
      const response = await api.get("/admin/sales-register/download", {
        responseType: "blob"
      });
      const downloadUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = getFileNameFromDisposition(
        response.headers["content-disposition"],
        salesRegister?.fileName || "order-sales-register.xlsx"
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      window.alert(getApiErrorMessage(error, "Unable to download the sales register right now."));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="mt-12 rounded-[3rem] border border-stone-100 bg-white p-8 shadow-2xl shadow-stone-200/50 sm:p-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-700">Sales Register</p>
          <h2 className="mt-2 text-3xl font-black text-stone-900">Excel order log</h2>
          <p className="mt-3 max-w-2xl text-sm font-medium text-stone-500">
            Every confirmed order is written into the same workbook format as your sample file and can be reviewed here by the admin.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center justify-center rounded-2xl bg-stone-900 px-6 py-3 text-xs font-black uppercase tracking-[0.25em] text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloading ? "Preparing..." : "Download Excel"}
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[2rem] border border-stone-100 bg-stone-50/60 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">Workbook</p>
          <p className="mt-3 text-sm font-black text-stone-900">{salesRegister?.fileName || "order-sales-register.xlsx"}</p>
        </div>
        <div className="rounded-[2rem] border border-stone-100 bg-stone-50/60 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">Last Updated</p>
          <p className="mt-3 text-sm font-black text-stone-900">{formatUpdatedAt(salesRegister?.updatedAt)}</p>
        </div>
        <div className="rounded-[2rem] border border-stone-100 bg-stone-50/60 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">Rows Logged</p>
          <p className="mt-3 text-sm font-black text-stone-900">
            {sheets.reduce((total, sheet) => total + Number(sheet.rowCount || 0), 0)}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {sheets.map((sheet) => (
          <button
            key={sheet.key}
            type="button"
            onClick={() => setActiveSheet(sheet.key)}
            className={`rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedSheet?.key === sheet.key ? "bg-stone-900 text-white shadow-xl shadow-stone-200" : "bg-stone-50 text-stone-500 hover:bg-stone-100"
            }`}
          >
            {sheet.name}
          </button>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-[2.5rem] border border-stone-50 bg-white shadow-2xl shadow-stone-100">
        <div className="flex items-center justify-between border-b border-stone-50 bg-stone-50/50 px-6 py-4">
          <div>
            <p className="text-sm font-black text-stone-900">{selectedSheet?.name || "Sales register"}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              {selectedSheet?.rowCount || 0} order rows
            </p>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[960px] text-left">
            <thead className="border-b border-stone-50 bg-stone-50/50">
              <tr>
                {(selectedSheet?.columns || []).map((column) => (
                  <th key={column} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {(selectedSheet?.rows || []).map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-stone-50/30">
                  {row.values.map((value, index) => (
                    <td key={`${row.id}-${selectedSheet.columns[index]}`} className="px-6 py-4 text-sm font-medium text-stone-700">
                      {formatCell(value)}
                    </td>
                  ))}
                </tr>
              ))}
              {(!selectedSheet?.rows || selectedSheet.rows.length === 0) && (
                <tr>
                  <td colSpan={selectedSheet?.columns?.length || 1} className="px-6 py-16 text-center text-sm font-medium text-stone-400">
                    No order rows have been written to this sheet yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
