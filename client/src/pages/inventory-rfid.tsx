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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { RfidReader, RfidZone, RfidTag, RfidEvent } from "@shared/schema";
import { insertRfidTagSchema } from "@shared/schema";
import { Radio, Wifi, WifiOff, Tag, MapPin, Activity, Plus, RefreshCw } from "lucide-react";

function fmt(d?: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

const newTagSchema = insertRfidTagSchema.pick({ tagEpc: true, tagType: true, materialType: true, batchNumber: true, notes: true }).extend({
  tagEpc: z.string().min(1, "EPC code is required"),
  tagType: z.string().min(1),
});

type NewTagForm = z.infer<typeof newTagSchema>;

export default function InventoryRFID() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("readers");
  const [tagDialogOpen, setTagDialogOpen] = useState(false);

  const { data: rfidReaders = [] } = useQuery<RfidReader[]>({ queryKey: ["/api/rfid/readers"] });
  const { data: rfidZones = [] } = useQuery<RfidZone[]>({ queryKey: ["/api/rfid/zones"] });
  const { data: rfidTags = [] } = useQuery<RfidTag[]>({ queryKey: ["/api/rfid/tags"] });
  const { data: rfidEvents = [] } = useQuery<RfidEvent[]>({ queryKey: ["/api/rfid/events"] });
  const { data: handlingUnits = [] } = useQuery<{ id: string; huCode: string; rfidEpc: string | null; barcodeValue: string | null; materialCode: string | null; materialName: string | null }[]>({ queryKey: ["/api/traceability/handling-units"] });
  const { data: rfidStats } = useQuery<{
    totalReaders: number; onlineReaders: number; activeTags: number;
    todayEvents: number; inboundToday: number; outboundToday: number;
  }>({ queryKey: ["/api/rfid/stats"] });

  const tagForm = useForm<NewTagForm>({
    resolver: zodResolver(newTagSchema),
    defaultValues: { tagType: "UHF", materialType: "raw-material" },
  });

  const createTagMutation = useMutation({
    mutationFn: (data: NewTagForm) => apiRequest("POST", "/api/rfid/tags", { ...data, status: "active", isActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rfid/tags"] });
      toast({ title: "RFID tag registered" });
      setTagDialogOpen(false);
      tagForm.reset();
    },
    onError: () => toast({ title: "Failed to register tag", variant: "destructive" }),
  });

  const readerVendorColor: Record<string, string> = {
    Zebra: "bg-blue-100 text-blue-800",
    Impinj: "bg-green-100 text-green-800",
    Alien: "bg-purple-100 text-purple-800",
    Honeywell: "bg-orange-100 text-orange-800",
  };

  const onlineCount = rfidReaders.filter(r => r.status === "online").length;
  const offlineCount = rfidReaders.filter(r => r.status === "offline").length;
  const errorCount = rfidReaders.filter(r => r.status === "error" || r.status === "maintenance").length;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">RFID Monitoring</h1>
              <p className="text-sm text-gray-500 mt-0.5">Real-time reader health, zone visibility, tag registry and live scan events</p>
            </div>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => { queryClient.invalidateQueries({ queryKey: ["/api/rfid/readers"] }); queryClient.invalidateQueries({ queryKey: ["/api/rfid/events"] }); }}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            {[
              { label: "Total Readers", value: rfidStats?.totalReaders ?? rfidReaders.length, color: "text-gray-800" },
              { label: "Online", value: onlineCount, color: "text-green-700" },
              { label: "Offline / Error", value: offlineCount + errorCount, color: "text-red-600" },
              { label: "Active Tags", value: rfidStats?.activeTags ?? rfidTags.filter(t => t.status === "active").length, color: "text-purple-700" },
              { label: "Events Today", value: rfidStats?.todayEvents ?? 0, color: "text-blue-700" },
              { label: "Inbound Today", value: rfidStats?.inboundToday ?? 0, color: "text-teal-700" },
            ].map(s => (
              <Card key={s.label} className="border border-gray-200">
                <CardContent className="p-3 text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white border border-gray-200 p-1 mb-5">
              <TabsTrigger value="readers" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs px-4">Reader Health</TabsTrigger>
              <TabsTrigger value="zones" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs px-4">Zone Activity</TabsTrigger>
              <TabsTrigger value="tags" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs px-4">Tag Registry</TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs px-4">Live Events</TabsTrigger>
            </TabsList>

            {/* ── Reader Health ─────────────────────────────────────────────── */}
            <TabsContent value="readers">
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Radio className="h-4 w-4 text-blue-600" /> RFID Readers — {rfidReaders.length} devices configured
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs">Reader Code</TableHead>
                        <TableHead className="text-xs">Vendor / Model</TableHead>
                        <TableHead className="text-xs">IP Address</TableHead>
                        <TableHead className="text-xs">Zone</TableHead>
                        <TableHead className="text-xs">Antennas</TableHead>
                        <TableHead className="text-xs">Last Heartbeat</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rfidReaders.map(r => {
                        const zone = rfidZones.find(z => z.id === r.zoneId);
                        return (
                          <TableRow key={r.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {r.status === "online" ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-400" />}
                                <span className="font-mono text-xs font-bold text-gray-800">{r.readerCode}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <Badge className={`${readerVendorColor[r.vendor] ?? "bg-gray-100 text-gray-700"} border-0 text-xs`}>{r.vendor}</Badge>
                                <p className="text-xs text-gray-500 mt-0.5">{r.model}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-gray-600">{r.ipAddress ?? "—"}</TableCell>
                            <TableCell className="text-xs text-gray-600">{zone?.name ?? "—"}</TableCell>
                            <TableCell className="text-xs text-center">{r.antennaCount ?? "—"}</TableCell>
                            <TableCell className="text-xs text-gray-400">{fmt(r.lastHeartbeat)}</TableCell>
                            <TableCell>
                              <Badge className={`border-0 text-xs ${r.status === "online" ? "bg-green-100 text-green-800" : r.status === "offline" ? "bg-red-100 text-red-700" : r.status === "error" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                                {r.status}
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

            {/* ── Zone Activity ─────────────────────────────────────────────── */}
            <TabsContent value="zones">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rfidZones.map(zone => {
                  const zoneReaders = rfidReaders.filter(r => r.zoneId === zone.id);
                  const zoneEvents = rfidEvents.filter(e => e.zoneId === zone.id);
                  const onlineInZone = zoneReaders.filter(r => r.status === "online").length;
                  const lastEvent = zoneEvents.sort((a, b) => new Date(b.scannedAt!).getTime() - new Date(a.scannedAt!).getTime())[0];
                  return (
                    <Card key={zone.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{zone.name}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="font-mono text-xs text-gray-400">{zone.zoneCode}</span>
                              <Badge className={`border-0 text-xs ${zone.type === "rack" ? "bg-blue-50 text-blue-700" : zone.type === "door" ? "bg-orange-50 text-orange-700" : zone.type === "room" ? "bg-green-50 text-green-700" : zone.type === "cold-storage" ? "bg-cyan-50 text-cyan-700" : zone.type === "quarantine" ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-700"}`}>
                                {zone.type}
                              </Badge>
                            </div>
                          </div>
                          <Badge className={`border-0 text-xs ${zone.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {zone.isActive ? "active" : "inactive"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-lg font-bold text-gray-800">{zoneReaders.length}</p>
                            <p className="text-xs text-gray-400">Readers</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2">
                            <p className="text-lg font-bold text-green-700">{onlineInZone}</p>
                            <p className="text-xs text-gray-400">Online</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2">
                            <p className="text-lg font-bold text-blue-700">{zoneEvents.length}</p>
                            <p className="text-xs text-gray-400">Events</p>
                          </div>
                        </div>
                        {lastEvent && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-400">Last event: {fmt(lastEvent.scannedAt)}</p>
                            <p className="font-mono text-xs text-purple-600 mt-0.5">{lastEvent.tagEpc}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* ── Tag Registry ─────────────────────────────────────────────── */}
            <TabsContent value="tags">
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-purple-600" /> RFID Tag Registry — {rfidTags.length} tags
                    </CardTitle>
                    <Button size="sm" className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setTagDialogOpen(true)}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Register Tag
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs">EPC Code</TableHead>
                        <TableHead className="text-xs">Tag Type</TableHead>
                        <TableHead className="text-xs">Linked HU</TableHead>
                        <TableHead className="text-xs">Material Code</TableHead>
                        <TableHead className="text-xs">Material Type</TableHead>
                        <TableHead className="text-xs">Batch / Lot</TableHead>
                        <TableHead className="text-xs">Last Zone</TableHead>
                        <TableHead className="text-xs">Last Reader</TableHead>
                        <TableHead className="text-xs">Last RSSI</TableHead>
                        <TableHead className="text-xs">Last Seen</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rfidTags.map(tag => {
                        const lastZone = tag.lastZoneId ? rfidZones.find(z => z.id === tag.lastZoneId) : null;
                        const lastReader = tag.lastReaderId ? rfidReaders.find(r => r.id === tag.lastReaderId) : null;
                        const linkedHU = handlingUnits.find(h => h.rfidEpc === tag.tagEpc);
                        return (
                          <TableRow key={tag.id} className="hover:bg-gray-50">
                            <TableCell className="font-mono text-xs font-bold text-purple-700">{tag.tagEpc}</TableCell>
                            <TableCell>
                              <Badge className="bg-purple-50 text-purple-700 border-0 text-xs">{tag.tagType}</Badge>
                            </TableCell>
                            <TableCell>
                              {linkedHU ? (
                                <span className="font-mono text-xs font-semibold text-blue-700">{linkedHU.huCode}</span>
                              ) : <span className="text-xs text-gray-400">—</span>}
                            </TableCell>
                            <TableCell className="text-xs font-medium text-gray-700">{linkedHU?.materialCode ?? (tag.materialType ? `${tag.materialType.split("-")[0].toUpperCase()}-001` : "—")}</TableCell>
                            <TableCell className="text-xs text-gray-600 capitalize">{(tag.materialType ?? "—").replace(/-/g, " ")}</TableCell>
                            <TableCell className="font-mono text-xs text-gray-600">{tag.batchNumber ?? "—"}</TableCell>
                            <TableCell className="text-xs text-gray-500">{lastZone?.name ?? "—"}</TableCell>
                            <TableCell className="text-xs text-gray-500">{lastReader?.readerCode ?? "—"}</TableCell>
                            <TableCell className="text-xs text-gray-400">{tag.lastRssi != null ? `${tag.lastRssi} dBm` : "—"}</TableCell>
                            <TableCell className="text-xs text-gray-400">{fmt(tag.lastSeenAt)}</TableCell>
                            <TableCell>
                              <Badge className={`border-0 text-xs ${tag.status === "active" ? "bg-green-100 text-green-800" : tag.status === "decommissioned" ? "bg-gray-100 text-gray-500" : tag.status === "lost" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                                {tag.status}
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

            {/* ── Live Events ───────────────────────────────────────────────── */}
            <TabsContent value="events">
              <Card className="border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-600" /> Live Scan Events — {rfidEvents.length} total
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs">Event #</TableHead>
                        <TableHead className="text-xs">Time</TableHead>
                        <TableHead className="text-xs">Event Type</TableHead>
                        <TableHead className="text-xs">EPC / Tag</TableHead>
                        <TableHead className="text-xs">Material</TableHead>
                        <TableHead className="text-xs">Batch</TableHead>
                        <TableHead className="text-xs">Reader</TableHead>
                        <TableHead className="text-xs">Zone</TableHead>
                        <TableHead className="text-xs">RSSI</TableHead>
                        <TableHead className="text-xs">Direction</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rfidEvents.slice(0, 30).map(ev => {
                        const reader = rfidReaders.find(r => r.id === ev.readerId);
                        const zone = rfidZones.find(z => z.id === ev.zoneId);
                        const tag = rfidTags.find(t => t.id === ev.tagId);
                        return (
                          <TableRow key={ev.id} className="hover:bg-gray-50">
                            <TableCell className="font-mono text-xs text-gray-500">{ev.eventNumber}</TableCell>
                            <TableCell className="text-xs text-gray-500">{fmt(ev.scannedAt)}</TableCell>
                            <TableCell>
                              <Badge className={`border-0 text-xs ${ev.eventType === "inbound" ? "bg-green-50 text-green-700" : ev.eventType === "outbound" ? "bg-orange-50 text-orange-700" : ev.eventType === "zone-transfer" ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-600"}`}>
                                {ev.eventType}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-purple-700">{tag?.tagEpc ?? ev.tagEpc}</TableCell>
                            <TableCell className="text-xs text-gray-600 capitalize">{(ev.materialType ?? "—").replace(/-/g, " ")}</TableCell>
                            <TableCell className="font-mono text-xs text-gray-500">{ev.batchNumber ?? tag?.batchNumber ?? "—"}</TableCell>
                            <TableCell className="text-xs">{reader?.readerCode ?? "—"}</TableCell>
                            <TableCell className="text-xs text-gray-500">{zone?.name ?? "—"}</TableCell>
                            <TableCell className="text-xs text-gray-400">{ev.rssi != null ? `${ev.rssi} dBm` : "—"}</TableCell>
                            <TableCell>
                              {ev.direction && (
                                <Badge className={`border-0 text-xs ${ev.direction === "in" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
                                  {ev.direction}
                                </Badge>
                              )}
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

      {/* Register Tag Dialog */}
      <Dialog open={tagDialogOpen} onOpenChange={v => { setTagDialogOpen(v); if (!v) tagForm.reset(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-purple-600" /> Register RFID Tag
            </DialogTitle>
          </DialogHeader>
          <Form {...tagForm}>
            <form onSubmit={tagForm.handleSubmit(d => createTagMutation.mutate(d))} className="space-y-3">
              <FormField control={tagForm.control} name="tagEpc" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">EPC Code *</FormLabel>
                  <FormControl><Input {...field} placeholder="E200001892180C..." className="h-9 text-xs font-mono" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={tagForm.control} name="tagType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Tag Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {["UHF", "HF", "LF"].map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={tagForm.control} name="materialType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Material Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {["raw-material", "packaging", "artwork", "finished-product", "instructions"].map(t => (
                          <SelectItem key={t} value={t} className="text-xs capitalize">{t.replace(/-/g, " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
              <FormField control={tagForm.control} name="batchNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Batch / Lot</FormLabel>
                  <FormControl><Input {...field} placeholder="BT-2024-001" className="h-9 text-xs" /></FormControl>
                </FormItem>
              )} />
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setTagDialogOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={createTagMutation.isPending} className="bg-purple-600 hover:bg-purple-700 text-white">
                  {createTagMutation.isPending ? "Registering..." : "Register Tag"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
