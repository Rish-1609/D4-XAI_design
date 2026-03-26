import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { HandlingUnit, RfidZone, RfidReader } from "@shared/schema";
import { Package, MapPin, Plus, Search, Layers, Warehouse, Edit, Trash2, ChevronRight, ChevronDown, Thermometer, ShieldAlert, Truck, Building2 } from "lucide-react";

// ─── Location Hierarchy data ────────────────────────────────────────────────
interface Location {
  code: string; name: string; type: string; parent: string | null;
  description: string; temperature?: string; capacity?: string; active: boolean;
}
const LOCATION_HIERARCHY: Location[] = [
  // Warehouse 1 — Raw Material Store
  { code: "WH-001", name: "Raw Material Warehouse", type: "warehouse", parent: null, description: "Primary raw material and API storage facility", capacity: "500 pallets", active: true },
  { code: "WH-001/DOCK-IN", name: "Inbound Receiving Dock", type: "dock", parent: "WH-001", description: "GRN entry point for all inbound raw materials and APIs", capacity: "20 pallets", active: true },
  { code: "WH-001/QUAR", name: "Quarantine Zone", type: "quarantine", parent: "WH-001", description: "Incoming materials held pending QC release — access restricted", temperature: "Ambient 15–25°C", capacity: "80 pallets", active: true },
  { code: "WH-001/QUAR/Q-01", name: "Quarantine Rack Q-01", type: "rack", parent: "WH-001/QUAR", description: "API quarantine — Row 01", capacity: "24 pallets", active: true },
  { code: "WH-001/QUAR/Q-02", name: "Quarantine Rack Q-02", type: "rack", parent: "WH-001/QUAR", description: "Excipient quarantine — Row 02", capacity: "24 pallets", active: true },
  { code: "WH-001/RM-A", name: "Raw Materials Rack A", type: "rack", parent: "WH-001", description: "API storage rack — alphabetical range A1 to A5", temperature: "15–25°C, RH ≤ 65%", capacity: "60 pallets", active: true },
  { code: "WH-001/RM-A/A-01", name: "Aisle A – Bay 01", type: "bay", parent: "WH-001/RM-A", description: "Ofloxacin, Ornidazole, Cefixime APIs", capacity: "12 pallets", active: true },
  { code: "WH-001/RM-A/A-02", name: "Aisle A – Bay 02", type: "bay", parent: "WH-001/RM-A", description: "Nimesulide, Paracetamol, Pantoprazole APIs", capacity: "12 pallets", active: true },
  { code: "WH-001/RM-A/A-03", name: "Aisle A – Bay 03", type: "bay", parent: "WH-001/RM-A", description: "Levofloxacin, Metformin, Amoxycillin APIs", capacity: "12 pallets", active: true },
  { code: "WH-001/RM-A/A-04", name: "Aisle A – Bay 04", type: "bay", parent: "WH-001/RM-A", description: "Atorvastatin, Rabeprazole, Domperidone APIs", capacity: "12 pallets", active: true },
  { code: "WH-001/RM-A/A-05", name: "Aisle A – Bay 05", type: "bay", parent: "WH-001/RM-A", description: "Overflow / seasonal API storage", capacity: "12 pallets", active: true },
  { code: "WH-001/RM-B", name: "Raw Materials Rack B", type: "rack", parent: "WH-001", description: "Excipient storage rack", temperature: "15–25°C, RH ≤ 65%", capacity: "60 pallets", active: true },
  { code: "WH-001/RM-B/B-01", name: "Aisle B – Bay 01", type: "bay", parent: "WH-001/RM-B", description: "MCC PH102, Croscarmellose Sodium, HPMC", capacity: "12 pallets", active: true },
  { code: "WH-001/RM-B/B-02", name: "Aisle B – Bay 02", type: "bay", parent: "WH-001/RM-B", description: "Starch Maize, Talc IP, Magnesium Stearate", capacity: "12 pallets", active: true },
  { code: "WH-001/RM-B/B-03", name: "Aisle B – Bay 03", type: "bay", parent: "WH-001/RM-B", description: "Lactose Monohydrate, Isomalt DC, PVP K30", capacity: "12 pallets", active: true },
  { code: "WH-001/COLD", name: "Cold Storage Room", type: "cold-storage", parent: "WH-001", description: "Temperature-controlled storage for heat-sensitive APIs and biologics", temperature: "2–8°C, RH ≤ 60%", capacity: "40 pallets", active: true },
  { code: "WH-001/COLD/CS-01", name: "Cold Store Bay CS-01", type: "bay", parent: "WH-001/COLD", description: "Biologics and temperature-sensitive vaccines", capacity: "20 pallets", active: true },
  { code: "WH-001/COLD/CS-02", name: "Cold Store Bay CS-02", type: "bay", parent: "WH-001/COLD", description: "Insulin analogs and hormone APIs", capacity: "20 pallets", active: true },
  // Warehouse 2 — Packaging Store
  { code: "WH-002", name: "Packaging Material Store", type: "warehouse", parent: null, description: "Packaging components, labels, foils, cartons and inserts", capacity: "300 pallets", active: true },
  { code: "WH-002/PKG-A", name: "Packaging Zone A — Foils", type: "room", parent: "WH-002", description: "ALU-ALU foil, PVC/PVDC blister foil, lidding foil", temperature: "≤ 25°C", capacity: "80 pallets", active: true },
  { code: "WH-002/PKG-A/PA-01", name: "Foil Bay PA-01", type: "bay", parent: "WH-002/PKG-A", description: "RKE foil and SJ Industries foil rolls", capacity: "30 pallets", active: true },
  { code: "WH-002/PKG-A/PA-02", name: "Foil Bay PA-02", type: "bay", parent: "WH-002/PKG-A", description: "PVDC-coated blister foil stock", capacity: "30 pallets", active: true },
  { code: "WH-002/PKG-B", name: "Packaging Zone B — Cartons & Labels", type: "room", parent: "WH-002", description: "Outer cartons, inner leaflets, printed labels, stickers", temperature: "Ambient", capacity: "100 pallets", active: true },
  { code: "WH-002/PKG-B/PB-01", name: "Carton Bay PB-01", type: "bay", parent: "WH-002/PKG-B", description: "Product-specific outer cartons (pre-printed)", capacity: "40 pallets", active: true },
  { code: "WH-002/PKG-B/PB-02", name: "Label Bay PB-02", type: "bay", parent: "WH-002/PKG-B", description: "Printed labels, serialization stickers", capacity: "20 pallets", active: true },
  { code: "WH-002/PKG-C", name: "Packaging Zone C — Bottles & Containers", type: "room", parent: "WH-002", description: "HDPE bottles, glass vials, caps, closures", temperature: "Ambient", capacity: "60 pallets", active: true },
  { code: "WH-002/PKG-C/PC-01", name: "Bottle Bay PC-01", type: "bay", parent: "WH-002/PKG-C", description: "HDPE 60ml / 100ml / 200ml bottles", capacity: "30 pallets", active: true },
  // Warehouse 3 — Finished Goods
  { code: "WH-003", name: "Finished Goods Warehouse", type: "warehouse", parent: null, description: "Finished pharmaceutical products awaiting dispatch or distribution", capacity: "400 pallets", active: true },
  { code: "WH-003/FG-A", name: "FG Zone A — Tablets & Capsules", type: "room", parent: "WH-003", description: "Solid oral dosage forms — tablets and capsules", temperature: "15–25°C, RH ≤ 60%", capacity: "120 pallets", active: true },
  { code: "WH-003/FG-A/FGA-01", name: "FG Bay FGA-01", type: "bay", parent: "WH-003/FG-A", description: "OFLACIN-OZ, PANTOBIS-DSR, CEFIXIME-200 finished stock", capacity: "40 pallets", active: true },
  { code: "WH-003/FG-A/FGA-02", name: "FG Bay FGA-02", type: "bay", parent: "WH-003/FG-A", description: "LEVOBACT-500, METFORMIN-SR-500, AMOXYCLAV-625 finished stock", capacity: "40 pallets", active: true },
  { code: "WH-003/FG-A/FGA-03", name: "FG Bay FGA-03", type: "bay", parent: "WH-003/FG-A", description: "ATORVASTATIN-10, RABEZOLE-20-DSR, DOLO-650 finished stock", capacity: "40 pallets", active: true },
  { code: "WH-003/FG-B", name: "FG Zone B — Export Hold", type: "room", parent: "WH-003", description: "Products cleared for export pending customs documentation", temperature: "15–25°C", capacity: "80 pallets", active: true },
  { code: "WH-003/DISPATCH", name: "Dispatch Staging Area", type: "dock", parent: "WH-003", description: "Outbound shipment staging — goods awaiting lorry loading", capacity: "30 pallets", active: true },
  { code: "WH-003/DOCK-OUT", name: "Outbound Dispatch Dock", type: "dock", parent: "WH-003", description: "Final outbound scan point before goods leave facility", capacity: "10 pallets", active: true },
];

const TYPE_META: Record<string, { color: string; bg: string; icon: typeof Building2 }> = {
  warehouse:    { color: "text-gray-700", bg: "bg-gray-100", icon: Building2 },
  dock:         { color: "text-orange-700", bg: "bg-orange-50", icon: Truck },
  quarantine:   { color: "text-red-700", bg: "bg-red-50", icon: ShieldAlert },
  rack:         { color: "text-blue-700", bg: "bg-blue-50", icon: Layers },
  room:         { color: "text-indigo-700", bg: "bg-indigo-50", icon: Warehouse },
  "cold-storage": { color: "text-cyan-700", bg: "bg-cyan-50", icon: Thermometer },
  bay:          { color: "text-green-700", bg: "bg-green-50", icon: Package },
};

function LocationHierarchy({ handlingUnits, rfidZones, rfidReaders }: {
  handlingUnits: HandlingUnit[]; rfidZones: RfidZone[]; rfidReaders: RfidReader[];
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["WH-001", "WH-002", "WH-003"]));
  const [locSearch, setLocSearch] = useState("");

  function toggle(code: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  }

  function getChildren(parent: string | null) {
    return LOCATION_HIERARCHY.filter(l => {
      if (locSearch) return l.name.toLowerCase().includes(locSearch.toLowerCase()) || l.code.toLowerCase().includes(locSearch.toLowerCase());
      return l.parent === parent;
    });
  }

  function huCount(locCode: string) {
    return handlingUnits.filter(h =>
      (h.currentLocationCode ?? "").startsWith(locCode) ||
      (h.currentLocationName ?? "").toLowerCase().includes(LOCATION_HIERARCHY.find(l => l.code === locCode)?.name.toLowerCase() ?? "___")
    ).length;
  }

  function rfidCount(locCode: string) {
    const zone = rfidZones.find(z => locCode.includes(z.zoneCode) || z.locationCode === locCode);
    if (!zone) return 0;
    return rfidReaders.filter(r => r.zoneId === zone.id).length;
  }

  function LocationRow({ loc, depth }: { loc: Location; depth: number }) {
    const children = LOCATION_HIERARCHY.filter(l => l.parent === loc.code);
    const hasChildren = children.length > 0;
    const isOpen = expanded.has(loc.code);
    const meta = TYPE_META[loc.type] ?? TYPE_META.bay;
    const Icon = meta.icon;
    const hus = huCount(loc.code);
    const readers = rfidCount(loc.code);

    return (
      <>
        <TableRow className="hover:bg-gray-50/70 group">
          <TableCell>
            <div className="flex items-center gap-1" style={{ paddingLeft: `${depth * 24}px` }}>
              <button onClick={() => toggle(loc.code)} className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                {hasChildren ? (isOpen ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />) : <span className="w-3.5" />}
              </button>
              <div className={`${meta.bg} rounded p-1 flex-shrink-0`}><Icon className={`h-3.5 w-3.5 ${meta.color}`} /></div>
              <span className={`font-mono text-xs font-bold ${meta.color}`}>{loc.code}</span>
            </div>
          </TableCell>
          <TableCell className="text-xs font-medium text-gray-800">{loc.name}</TableCell>
          <TableCell>
            <Badge className={`border-0 text-xs ${meta.bg} ${meta.color}`}>{loc.type.replace(/-/g, " ")}</Badge>
          </TableCell>
          <TableCell className="text-xs text-gray-500">{loc.description}</TableCell>
          <TableCell className="text-xs text-gray-500">
            {loc.temperature ? <span className="flex items-center gap-1"><Thermometer className="h-3 w-3 text-cyan-500" />{loc.temperature}</span> : <span className="text-gray-300">Ambient</span>}
          </TableCell>
          <TableCell className="text-xs text-gray-600">{loc.capacity ?? "—"}</TableCell>
          <TableCell className="text-xs font-semibold text-blue-700">{hus > 0 ? hus : <span className="text-gray-300">0</span>}</TableCell>
          <TableCell className="text-xs text-purple-600">{readers > 0 ? `${readers} reader${readers > 1 ? "s" : ""}` : <span className="text-gray-300">—</span>}</TableCell>
          <TableCell>
            <Badge className={`border-0 text-xs ${loc.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-400"}`}>
              {loc.active ? "Active" : "Inactive"}
            </Badge>
          </TableCell>
        </TableRow>
        {hasChildren && isOpen && children.map(child => (
          <LocationRow key={child.code} loc={child} depth={depth + 1} />
        ))}
      </>
    );
  }

  const topLevel = locSearch
    ? LOCATION_HIERARCHY.filter(l => l.name.toLowerCase().includes(locSearch.toLowerCase()) || l.code.toLowerCase().includes(locSearch.toLowerCase()))
    : LOCATION_HIERARCHY.filter(l => l.parent === null);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Warehouses", value: LOCATION_HIERARCHY.filter(l => l.type === "warehouse").length, color: "text-gray-700", bg: "bg-gray-50 border-gray-200" },
          { label: "Storage Zones/Rooms", value: LOCATION_HIERARCHY.filter(l => ["rack","room","cold-storage","quarantine"].includes(l.type)).length, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
          { label: "Bays / Aisles", value: LOCATION_HIERARCHY.filter(l => l.type === "bay").length, color: "text-green-700", bg: "bg-green-50 border-green-200" },
          { label: "Dock Points", value: LOCATION_HIERARCHY.filter(l => l.type === "dock").length, color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
        ].map(s => (
          <Card key={s.label} className={`border ${s.bg}`}>
            <CardContent className="p-3">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-600" /> Warehouse Location Hierarchy
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                <Input value={locSearch} onChange={e => setLocSearch(e.target.value)}
                  placeholder="Search location code or name..." className="pl-8 h-8 text-xs w-64" />
              </div>
              {!locSearch && (
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => {
                  if (expanded.size > 3) setExpanded(new Set(["WH-001","WH-002","WH-003"]));
                  else setExpanded(new Set(LOCATION_HIERARCHY.map(l => l.code)));
                }}>
                  {expanded.size > 3 ? "Collapse All" : "Expand All"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs font-semibold w-56">Location Code</TableHead>
                <TableHead className="text-xs font-semibold">Name</TableHead>
                <TableHead className="text-xs font-semibold w-28">Type</TableHead>
                <TableHead className="text-xs font-semibold">Description</TableHead>
                <TableHead className="text-xs font-semibold w-36">Temperature</TableHead>
                <TableHead className="text-xs font-semibold w-24">Capacity</TableHead>
                <TableHead className="text-xs font-semibold w-16">HUs</TableHead>
                <TableHead className="text-xs font-semibold w-24">RFID</TableHead>
                <TableHead className="text-xs font-semibold w-20">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topLevel.map(loc => (
                <LocationRow key={loc.code} loc={loc} depth={0} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function huStatusBadge(status: string) {
  const map: Record<string, string> = {
    available: "bg-green-100 text-green-800",
    "in-transit": "bg-blue-100 text-blue-800",
    dispatched: "bg-gray-100 text-gray-600",
    scrapped: "bg-red-100 text-red-700",
    "on-hold": "bg-orange-100 text-orange-800",
    "qc-hold": "bg-purple-100 text-purple-800",
  };
  return (
    <Badge className={`${map[status] ?? "bg-gray-100 text-gray-600"} border-0 text-xs font-medium`}>
      {(status ?? "").replace(/-/g, " ")}
    </Badge>
  );
}

const huSchema = z.object({
  huCode: z.string().min(1, "HU code is required"),
  huType: z.string().min(1, "Select HU type"),
  materialCode: z.string().optional(),
  materialName: z.string().optional(),
  batchNumber: z.string().optional(),
  lotNumber: z.string().optional(),
  quantity: z.string().optional(),
  uom: z.string().optional(),
  currentLocationCode: z.string().optional(),
  currentLocationName: z.string().optional(),
  barcodeValue: z.string().optional(),
  rfidEpc: z.string().optional(),
  supplierName: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});
type HUForm = z.infer<typeof huSchema>;

export default function InventoryMaster() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("handling-units");
  const [addHUOpen, setAddHUOpen] = useState(false);
  const [editHU, setEditHU] = useState<HandlingUnit | null>(null);
  const [huFilter, setHuFilter] = useState("");
  const [huTypeFilter, setHuTypeFilter] = useState("all");

  const { data: handlingUnits = [], isLoading: loadingHUs } = useQuery<HandlingUnit[]>({
    queryKey: ["/api/traceability/handling-units"],
  });
  const { data: rfidZones = [] } = useQuery<RfidZone[]>({ queryKey: ["/api/rfid/zones"] });
  const { data: rfidReaders = [] } = useQuery<RfidReader[]>({ queryKey: ["/api/rfid/readers"] });

  const form = useForm<HUForm>({
    resolver: zodResolver(huSchema),
    defaultValues: { huType: "pallet", uom: "units", quantity: "1", status: "available" },
  });

  const createMutation = useMutation({
    mutationFn: (data: HUForm) => apiRequest("POST", "/api/traceability/handling-units", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/handling-units"] });
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/stats"] });
      toast({ title: "Handling unit created successfully" });
      setAddHUOpen(false);
      form.reset();
    },
    onError: () => toast({ title: "Failed to create handling unit", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HUForm> }) =>
      apiRequest("PUT", `/api/traceability/handling-units/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/handling-units"] });
      toast({ title: "Handling unit updated" });
      setEditHU(null);
      form.reset();
    },
    onError: () => toast({ title: "Failed to update handling unit", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/traceability/handling-units/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/handling-units"] });
      toast({ title: "Handling unit removed" });
    },
    onError: () => toast({ title: "Failed to remove", variant: "destructive" }),
  });

  function openEdit(hu: HandlingUnit) {
    setEditHU(hu);
    form.reset({
      huCode: hu.huCode, huType: hu.huType, materialCode: hu.materialCode ?? "",
      materialName: hu.materialName ?? "", batchNumber: hu.batchNumber ?? "",
      lotNumber: hu.lotNumber ?? "", quantity: hu.quantity ?? "0", uom: hu.uom ?? "units",
      currentLocationCode: hu.currentLocationCode ?? "", currentLocationName: hu.currentLocationName ?? "",
      barcodeValue: hu.barcodeValue ?? "", rfidEpc: hu.rfidEpc ?? "",
      supplierName: hu.supplierName ?? "", status: hu.status, notes: hu.notes ?? "",
    });
  }

  const filteredHUs = handlingUnits.filter(h => {
    const matchType = huTypeFilter === "all" || h.huType === huTypeFilter;
    const matchSearch = !huFilter ||
      h.huCode.toLowerCase().includes(huFilter.toLowerCase()) ||
      (h.materialName ?? "").toLowerCase().includes(huFilter.toLowerCase()) ||
      (h.batchNumber ?? "").toLowerCase().includes(huFilter.toLowerCase()) ||
      (h.currentLocationName ?? "").toLowerCase().includes(huFilter.toLowerCase());
    return matchType && matchSearch;
  });

  const huTypeCounts = handlingUnits.reduce((acc, h) => {
    acc[h.huType] = (acc[h.huType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const HUForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(d => editHU ? updateMutation.mutate({ id: editHU.id, data: d }) : createMutation.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="huCode" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">HU Code *</FormLabel>
              <FormControl><Input {...field} placeholder="PALT-00001" className="h-9 text-xs" disabled={!!editHU} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="huType" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">HU Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {["pallet", "carton", "item", "tote"].map(t => <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="materialCode" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Material Code</FormLabel>
              <FormControl><Input {...field} placeholder="RM-001" className="h-9 text-xs" /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="materialName" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Material Name</FormLabel>
              <FormControl><Input {...field} placeholder="Paracetamol API" className="h-9 text-xs" /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="batchNumber" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Batch Number</FormLabel>
              <FormControl><Input {...field} placeholder="BT-2024-001" className="h-9 text-xs" /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="lotNumber" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Lot Number</FormLabel>
              <FormControl><Input {...field} placeholder="LOT-001" className="h-9 text-xs" /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="quantity" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Quantity</FormLabel>
              <FormControl><Input {...field} type="number" className="h-9 text-xs" /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="uom" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Unit of Measure</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {["units", "kg", "g", "mg", "liters", "ml", "sheets", "rolls"].map(u => <SelectItem key={u} value={u} className="text-xs">{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormItem>
          )} />
          <FormField control={form.control} name="currentLocationCode" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Location Code</FormLabel>
              <FormControl><Input {...field} placeholder="A-01-R01" className="h-9 text-xs" /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="currentLocationName" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Location Name</FormLabel>
              <FormControl><Input {...field} placeholder="Raw Materials Rack A" className="h-9 text-xs" /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="barcodeValue" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Barcode Value</FormLabel>
              <FormControl><Input {...field} placeholder="PALT-00001" className="h-9 text-xs" /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="rfidEpc" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">RFID EPC</FormLabel>
              <FormControl><Input {...field} placeholder="E200001892..." className="h-9 text-xs" /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="supplierName" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Supplier</FormLabel>
              <FormControl><Input {...field} placeholder="Pharma APIs Ltd" className="h-9 text-xs" /></FormControl>
            </FormItem>
          )} />
          {editHU && (
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {["available", "in-transit", "dispatched", "scrapped", "on-hold", "qc-hold"].map(s => (
                      <SelectItem key={s} value={s} className="text-xs capitalize">{s.replace(/-/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
          )}
        </div>
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Notes</FormLabel>
            <FormControl><Textarea {...field} rows={2} className="text-xs resize-none" placeholder="Additional notes..." /></FormControl>
          </FormItem>
        )} />
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => { setAddHUOpen(false); setEditHU(null); form.reset(); }}>Cancel</Button>
          <Button type="submit" size="sm" disabled={createMutation.isPending || updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
            {createMutation.isPending || updateMutation.isPending ? "Saving..." : editHU ? "Update HU" : "Create HU"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Inventory Master Data</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage handling units, packaging hierarchy and location directory</p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Handling Units", value: handlingUnits.length, sub: `${huTypeCounts.pallet ?? 0} pallets`, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Cartons", value: huTypeCounts.carton ?? 0, sub: "active cartons", icon: Layers, color: "text-indigo-600", bg: "bg-indigo-50" },
              { label: "Warehouse Zones", value: rfidZones.length, sub: "configured zones", icon: Warehouse, color: "text-green-600", bg: "bg-green-50" },
              { label: "On Hold", value: handlingUnits.filter(h => h.status === "on-hold" || h.status === "qc-hold").length, sub: "need attention", icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
            ].map(s => (
              <Card key={s.label} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`${s.bg} rounded-lg p-2`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                      <p className="text-xs text-gray-400">{s.sub}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white border border-gray-200 p-1 mb-5">
              <TabsTrigger value="handling-units" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs px-4">
                Handling Units
              </TabsTrigger>
              <TabsTrigger value="locations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs px-4">
                Location Directory
              </TabsTrigger>
            </TabsList>

            {/* ── Handling Units ──────────────────────────────────────────── */}
            <TabsContent value="handling-units">
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" /> Handling Unit Registry
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <div className="relative">
                        <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                        <Input value={huFilter} onChange={e => setHuFilter(e.target.value)}
                          placeholder="Search HU / material / batch / location..." className="pl-8 h-8 text-xs w-64" />
                      </div>
                      <Select value={huTypeFilter} onValueChange={setHuTypeFilter}>
                        <SelectTrigger className="h-8 text-xs w-32"><SelectValue placeholder="All types" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="text-xs">All Types</SelectItem>
                          {["pallet", "carton", "item", "tote"].map(t => <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { form.reset({ huType: "pallet", uom: "units", quantity: "1", status: "available" }); setAddHUOpen(true); }}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add HU
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingHUs ? (
                    <div className="p-10 text-center text-gray-400 text-sm">Loading handling units...</div>
                  ) : filteredHUs.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 text-sm">No handling units found</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold">HU Code</TableHead>
                          <TableHead className="text-xs font-semibold">Type</TableHead>
                          <TableHead className="text-xs font-semibold">Material</TableHead>
                          <TableHead className="text-xs font-semibold">Batch / Lot</TableHead>
                          <TableHead className="text-xs font-semibold">Qty / UOM</TableHead>
                          <TableHead className="text-xs font-semibold">Current Location</TableHead>
                          <TableHead className="text-xs font-semibold">Barcode</TableHead>
                          <TableHead className="text-xs font-semibold">RFID EPC</TableHead>
                          <TableHead className="text-xs font-semibold">Supplier</TableHead>
                          <TableHead className="text-xs font-semibold">Status</TableHead>
                          <TableHead className="text-xs font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHUs.map(hu => (
                          <TableRow key={hu.id} className="hover:bg-gray-50">
                            <TableCell className="font-mono text-xs font-bold text-blue-700">{hu.huCode}</TableCell>
                            <TableCell>
                              <Badge className={`border-0 text-xs ${hu.huType === "pallet" ? "bg-blue-50 text-blue-700" : hu.huType === "carton" ? "bg-indigo-50 text-indigo-700" : hu.huType === "tote" ? "bg-teal-50 text-teal-700" : "bg-gray-50 text-gray-700"}`}>
                                {hu.huType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-xs font-medium text-gray-800">{hu.materialName ?? "—"}</p>
                                <p className="text-xs text-gray-400">{hu.materialCode ?? ""}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-gray-600">
                              <div>
                                <p>{hu.batchNumber ?? "—"}</p>
                                {hu.lotNumber && <p className="text-gray-400">{hu.lotNumber}</p>}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs font-semibold">{hu.quantity} {hu.uom}</TableCell>
                            <TableCell>
                              <div>
                                <p className="text-xs text-gray-700">{hu.currentLocationName ?? "—"}</p>
                                <p className="text-xs text-gray-400 font-mono">{hu.currentLocationCode ?? ""}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-green-700">{hu.barcodeValue ?? "—"}</TableCell>
                            <TableCell className="font-mono text-xs text-purple-600 max-w-[120px] truncate" title={hu.rfidEpc ?? ""}>{hu.rfidEpc ?? "—"}</TableCell>
                            <TableCell className="text-xs text-gray-500">{hu.supplierName ?? "—"}</TableCell>
                            <TableCell>{huStatusBadge(hu.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(hu)}>
                                  <Edit className="h-3.5 w-3.5 text-gray-500" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deleteMutation.mutate(hu.id)}>
                                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Location Directory ──────────────────────────────────────── */}
            <TabsContent value="locations">
              <LocationHierarchy handlingUnits={handlingUnits} rfidZones={rfidZones} rfidReaders={rfidReaders} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add HU Dialog */}
      <Dialog open={addHUOpen} onOpenChange={v => { setAddHUOpen(v); if (!v) form.reset(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" /> Create Handling Unit
            </DialogTitle>
          </DialogHeader>
          {HUForm}
        </DialogContent>
      </Dialog>

      {/* Edit HU Dialog */}
      <Dialog open={!!editHU} onOpenChange={v => { if (!v) { setEditHU(null); form.reset(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" /> Edit Handling Unit — {editHU?.huCode}
            </DialogTitle>
          </DialogHeader>
          {HUForm}
        </DialogContent>
      </Dialog>
    </div>
  );
}
