import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { HandlingUnit, Barcode, MovementLedgerEntry } from "@shared/schema";
import {
  Search, Package2, QrCode, History, ArrowRight, Clock,
  MapPin, Scan, ScanLine, ChevronRight, FileText, AlertTriangle
} from "lucide-react";

const SEARCH_HINTS = [
  { label: "HU Code", example: "PAL-001", icon: Package2 },
  { label: "Barcode", example: "BC-12345678", icon: QrCode },
  { label: "Batch / Lot", example: "BT-2024-001", icon: FileText },
  { label: "RFID EPC", example: "E28011600000020DE9C4A3A4", icon: ScanLine },
  { label: "Purchase Order", example: "PO-2024-001", icon: FileText },
  { label: "Shipment", example: "SHI-2024-001", icon: Package2 },
];

type SearchResults = {
  handlingUnits: HandlingUnit[];
  barcodes: Barcode[];
  movements: MovementLedgerEntry[];
};

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  "in-transit": "bg-blue-100 text-blue-800",
  "qc-hold": "bg-purple-100 text-purple-800",
  "on-hold": "bg-orange-100 text-orange-800",
  dispatched: "bg-gray-100 text-gray-500",
  scrapped: "bg-red-100 text-red-700",
};

const MVT_COLORS: Record<string, string> = {
  stock_in: "bg-green-50 text-green-800 border-green-200",
  putaway: "bg-blue-50 text-blue-800 border-blue-200",
  internal_transfer: "bg-indigo-50 text-indigo-800 border-indigo-200",
  issue_to_production: "bg-amber-50 text-amber-800 border-amber-200",
  production_receipt: "bg-teal-50 text-teal-800 border-teal-200",
  stock_out: "bg-orange-50 text-orange-800 border-orange-200",
  QC_hold: "bg-purple-50 text-purple-800 border-purple-200",
  cycle_count: "bg-rose-50 text-rose-800 border-rose-200",
};

function fmt(d?: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function InventoryTraceabilitySearch() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [selectedHU, setSelectedHU] = useState<HandlingUnit | null>(null);
  const [huMovements, setHuMovements] = useState<MovementLedgerEntry[]>([]);
  const [loadingJourney, setLoadingJourney] = useState(false);

  async function runSearch(q?: string) {
    const term = (q ?? query).trim();
    if (!term) return;
    setLoading(true);
    setResults(null);
    setSelectedHU(null);
    setHuMovements([]);
    try {
      const resp = await fetch(`/api/traceability/search?q=${encodeURIComponent(term)}`);
      if (!resp.ok) throw new Error("Search failed");
      const data = await resp.json();
      setResults(data);
    } catch {
      toast({ title: "Search failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function loadJourney(hu: HandlingUnit) {
    setSelectedHU(hu);
    setLoadingJourney(true);
    try {
      const resp = await fetch(`/api/traceability/movements?huCode=${encodeURIComponent(hu.huCode)}`);
      if (!resp.ok) throw new Error();
      setHuMovements(await resp.json());
    } catch {
      toast({ title: "Could not load journey", variant: "destructive" });
    } finally {
      setLoadingJourney(false);
    }
  }

  const hasResults = results && (results.handlingUnits.length > 0 || results.barcodes.length > 0 || results.movements.length > 0);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Traceability Search</h1>
            <p className="text-sm text-gray-500 mt-0.5">Trace any handling unit, barcode, RFID tag, batch or document through its full supply chain journey</p>
          </div>

          {/* Search bar */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && runSearch()}
                  placeholder="Search by HU code, barcode, RFID EPC, batch, PO, shipment, production order..."
                  className="pl-10 h-11 text-sm rounded-xl border-gray-200 focus:border-blue-400"
                />
              </div>
              <Button size="default" onClick={() => runSearch()} disabled={loading || !query.trim()}
                className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>

            {/* Hints */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-400 self-center">Try:</span>
              {SEARCH_HINTS.map(h => (
                <button key={h.label} onClick={() => { setQuery(h.example); runSearch(h.example); }}
                  className="flex items-center gap-1.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg px-2.5 py-1 transition-colors">
                  <h.icon className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{h.label}:</span>
                  <span className="text-xs font-mono text-blue-600">{h.example}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-16 text-gray-400">
              <Search className="h-8 w-8 mx-auto mb-3 animate-pulse" />
              <p className="text-sm">Searching across all records...</p>
            </div>
          )}

          {/* No results */}
          {results && !hasResults && (
            <div className="text-center py-16 text-gray-400">
              <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-yellow-400" />
              <p className="text-sm font-medium text-gray-600">No results found for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Try a different code, batch number, or document reference</p>
            </div>
          )}

          {/* Results */}
          {hasResults && (
            <div className="space-y-5">
              {/* Summary bar */}
              <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <Search className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Results for "{query}"</span>
                <div className="flex gap-2 ml-2">
                  {results.handlingUnits.length > 0 && <Badge className="bg-blue-100 text-blue-700 border-0">{results.handlingUnits.length} Handling Units</Badge>}
                  {results.barcodes.length > 0 && <Badge className="bg-green-100 text-green-700 border-0">{results.barcodes.length} Barcodes</Badge>}
                  {results.movements.length > 0 && <Badge className="bg-amber-100 text-amber-700 border-0">{results.movements.length} Movements</Badge>}
                </div>
              </div>

              {/* Handling Units */}
              {results.handlingUnits.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Package2 className="h-3.5 w-3.5" /> Handling Units
                  </h3>
                  <div className="space-y-2">
                    {results.handlingUnits.map(hu => (
                      <div key={hu.id}
                        onClick={() => loadJourney(hu)}
                        className={`bg-white border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${selectedHU?.id === hu.id ? "border-blue-400 ring-2 ring-blue-200" : "border-gray-200 hover:border-blue-200"}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3">
                            <div className="bg-blue-50 rounded-lg p-2">
                              <Package2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-bold text-blue-700 text-sm">{hu.huCode}</span>
                                <Badge className={`border-0 text-xs ${STATUS_COLORS[hu.status] ?? "bg-gray-100 text-gray-600"}`}>{hu.status}</Badge>
                                <Badge className="bg-gray-50 text-gray-600 border-0 text-xs">{hu.huType}</Badge>
                              </div>
                              <p className="text-sm font-semibold text-gray-800">{hu.materialName ?? hu.materialCode ?? "—"}</p>
                              <div className="flex gap-4 mt-1">
                                <span className="text-xs text-gray-400">Batch: <span className="font-mono text-gray-600">{hu.batchNumber ?? "—"}</span></span>
                                <span className="text-xs text-gray-400">Qty: <span className="font-semibold text-gray-700">{hu.quantity} {hu.uom}</span></span>
                                <span className="text-xs text-gray-400">Location: <span className="text-gray-600">{hu.currentLocationName ?? hu.currentLocationCode ?? "—"}</span></span>
                              </div>
                              <div className="flex gap-4 mt-0.5">
                                {hu.barcodeValue && <span className="text-xs text-gray-400">Barcode: <span className="font-mono text-green-700">{hu.barcodeValue}</span></span>}
                                {hu.rfidEpc && <span className="text-xs text-gray-400">RFID: <span className="font-mono text-purple-700">{hu.rfidEpc.substring(0, 16)}...</span></span>}
                                {hu.supplierName && <span className="text-xs text-gray-400">Supplier: {hu.supplierName}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800">
                            <span>View Journey</span>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Item Journey (movement ledger) */}
              {selectedHU && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <History className="h-3.5 w-3.5" /> Journey of {selectedHU.huCode}
                    <Badge className="bg-gray-100 text-gray-600 border-0">{huMovements.length} movements</Badge>
                  </h3>
                  {loadingJourney ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Loading movement history...</div>
                  ) : huMovements.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-400">
                      No movement history recorded for this handling unit yet.
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-gray-200 z-0" />
                      <div className="space-y-3">
                        {huMovements.map((m, i) => (
                          <div key={m.id} className="relative flex gap-4">
                            {/* Timeline dot */}
                            <div className={`flex-shrink-0 z-10 w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${MVT_COLORS[m.movementType] ?? "bg-gray-50 text-gray-600 border-gray-200"} border`}>
                              {i + 1}
                            </div>
                            {/* Movement card */}
                            <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge className={`border text-xs ${MVT_COLORS[m.movementType] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                    {m.movementType.replace(/_/g, " ")}
                                  </Badge>
                                  <span className="font-mono text-xs font-bold text-indigo-600">{m.movementNumber}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  {fmt(m.movedAt)}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                {/* From → To */}
                                <div>
                                  <p className="text-gray-400 mb-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</p>
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-600">{m.fromLocationName ?? m.fromLocationCode ?? "—"}</span>
                                    {m.toLocationName && <>
                                      <ArrowRight className="h-3 w-3 text-gray-300" />
                                      <span className="font-medium text-gray-800">{m.toLocationName}</span>
                                    </>}
                                  </div>
                                </div>
                                {/* Status change */}
                                <div>
                                  <p className="text-gray-400 mb-0.5">Status</p>
                                  {m.statusBefore && m.statusAfter ? (
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-500">{m.statusBefore}</span>
                                      <ArrowRight className="h-3 w-3 text-gray-300" />
                                      <span className={`font-semibold ${m.statusAfter === "available" ? "text-green-700" : m.statusAfter?.includes("hold") ? "text-purple-700" : "text-gray-700"}`}>{m.statusAfter}</span>
                                    </div>
                                  ) : "—"}
                                </div>
                                {/* Source document */}
                                <div>
                                  <p className="text-gray-400 mb-0.5 flex items-center gap-1"><FileText className="h-3 w-3" /> Document</p>
                                  {m.sourceDocNumber ? (
                                    <p className="font-mono font-semibold text-blue-700">{m.sourceDocNumber}</p>
                                  ) : <span className="text-gray-300">—</span>}
                                </div>
                                {/* Operator + scan */}
                                <div>
                                  <p className="text-gray-400 mb-0.5">Operator / Scan</p>
                                  <div className="flex items-center gap-1">
                                    {m.scanMethod === "rfid" ? <ScanLine className="h-3 w-3 text-purple-500" /> :
                                     m.scanMethod === "barcode" ? <Scan className="h-3 w-3 text-green-500" /> : null}
                                    <span className="text-gray-600">{m.performedBy ?? "—"}</span>
                                  </div>
                                </div>
                              </div>

                              {m.notes && (
                                <div className="mt-2 text-xs text-gray-400 bg-gray-50 rounded px-2 py-1">{m.notes}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Barcode Results */}
              {results.barcodes.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <QrCode className="h-3.5 w-3.5" /> Barcode Records
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {results.barcodes.map((bc, i) => (
                      <div key={bc.id} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-gray-100" : ""}`}>
                        <div className="flex items-center gap-3">
                          <QrCode className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="font-mono text-sm font-bold text-green-700">{bc.barcodeValue}</p>
                            <p className="text-xs text-gray-400">{bc.barcodeType} — {bc.labelType ?? "—"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {bc.linkedHuCode && <span>HU: <span className="font-mono font-semibold text-blue-700">{bc.linkedHuCode}</span></span>}
                          {bc.materialCode && <span>Mat: {bc.materialCode}</span>}
                          {bc.batchNumber && <span>Batch: <span className="font-mono">{bc.batchNumber}</span></span>}
                          <Badge className={`border-0 text-xs ${bc.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>{bc.status}</Badge>
                          <span className="text-gray-400">{fmt(bc.printedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Movement search results */}
              {results.movements.length > 0 && !selectedHU && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <History className="h-3.5 w-3.5" /> Movement Records
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {results.movements.map((m, i) => (
                      <div key={m.id} className={`px-4 py-3 ${i > 0 ? "border-t border-gray-100" : ""}`}>
                        <div className="flex items-center gap-3">
                          <Badge className={`border text-xs ${MVT_COLORS[m.movementType] ?? "bg-gray-50 text-gray-600"}`}>
                            {m.movementType.replace(/_/g, " ")}
                          </Badge>
                          <span className="font-mono text-xs font-bold text-indigo-600">{m.movementNumber}</span>
                          <span className="text-xs text-gray-400">{fmt(m.movedAt)}</span>
                        </div>
                        <div className="flex gap-4 mt-1.5 text-xs text-gray-500">
                          <span>HU: <span className="font-mono font-semibold text-blue-700">{m.huCode ?? "—"}</span></span>
                          {m.sourceDocNumber && <span>Doc: <span className="font-mono text-indigo-700">{m.sourceDocNumber}</span></span>}
                          <span>{m.fromLocationName ?? "—"}{m.toLocationName ? ` → ${m.toLocationName}` : ""}</span>
                          <span>by {m.performedBy ?? "—"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty state — no search done yet */}
          {!results && !loading && (
            <div className="text-center py-20 text-gray-400">
              <div className="bg-blue-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-10 w-10 text-blue-300" />
              </div>
              <p className="text-base font-medium text-gray-600 mb-1">Start by searching for any identifier</p>
              <p className="text-sm text-gray-400">Enter a handling unit code, barcode, RFID EPC, batch number, PO, shipment, or production order number</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
