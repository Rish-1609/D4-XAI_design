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
import { Package, MapPin, Plus, Search, Layers, Warehouse, Edit, Trash2 } from "lucide-react";

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
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-600" /> Warehouse Location Directory
                  </CardTitle>
                  <p className="text-xs text-gray-500">Zones and areas configured in the warehouse</p>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs font-semibold">Zone Code</TableHead>
                        <TableHead className="text-xs font-semibold">Zone Name</TableHead>
                        <TableHead className="text-xs font-semibold">Type</TableHead>
                        <TableHead className="text-xs font-semibold">Readers Assigned</TableHead>
                        <TableHead className="text-xs font-semibold">HUs in Zone</TableHead>
                        <TableHead className="text-xs font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rfidZones.map(zone => {
                        const zoneReaders = rfidReaders.filter(r => r.zoneId === zone.id);
                        const zoneHUs = handlingUnits.filter(h =>
                          h.currentLocationCode?.toLowerCase().includes(zone.zoneCode.toLowerCase()) ||
                          h.currentLocationName?.toLowerCase().includes(zone.name.toLowerCase())
                        );
                        return (
                          <TableRow key={zone.id} className="hover:bg-gray-50">
                            <TableCell className="font-mono text-xs font-bold text-indigo-700">{zone.zoneCode}</TableCell>
                            <TableCell className="text-xs font-medium text-gray-800">{zone.name}</TableCell>
                            <TableCell>
                              <Badge className={`border-0 text-xs ${zone.type === "rack" ? "bg-blue-50 text-blue-700" : zone.type === "door" ? "bg-orange-50 text-orange-700" : zone.type === "room" ? "bg-green-50 text-green-700" : zone.type === "cold-storage" ? "bg-cyan-50 text-cyan-700" : zone.type === "quarantine" ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-700"}`}>
                                {zone.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-gray-600">{zoneReaders.length} reader{zoneReaders.length !== 1 ? "s" : ""}</TableCell>
                            <TableCell className="text-xs font-semibold text-gray-700">{zoneHUs.length}</TableCell>
                            <TableCell>
                              <Badge className={`border-0 text-xs ${zone.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                                {zone.isActive ? "active" : "inactive"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
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
