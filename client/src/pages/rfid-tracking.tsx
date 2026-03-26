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
import type { RfidZone, RfidReader, RfidTag, RfidEvent, InsertRfidZone, InsertRfidReader, InsertRfidTag, InsertRfidEvent } from "@shared/schema";
import { insertRfidZoneSchema, insertRfidReaderSchema, insertRfidTagSchema, insertRfidEventSchema } from "@shared/schema";
import {
  Wifi,
  WifiOff,
  Tag,
  Zap,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  Activity,
  Radio,
  MapPin,
  Plus,
  RefreshCw,
  Eye,
  Trash2,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers,
  TrendingUp,
  TrendingDown,
  Signal,
} from "lucide-react";
import { format } from "date-fns";

// ==================== Helpers ====================

function statusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    online:       { label: "Online",       className: "bg-green-100 text-green-800" },
    offline:      { label: "Offline",      className: "bg-gray-100 text-gray-600" },
    error:        { label: "Error",        className: "bg-red-100 text-red-800" },
    maintenance:  { label: "Maintenance",  className: "bg-yellow-100 text-yellow-800" },
    active:       { label: "Active",       className: "bg-green-100 text-green-800" },
    decommissioned:{ label: "Decomm.",    className: "bg-gray-100 text-gray-500" },
    lost:         { label: "Lost",         className: "bg-red-100 text-red-800" },
    damaged:      { label: "Damaged",      className: "bg-orange-100 text-orange-800" },
    inbound:      { label: "Inbound",      className: "bg-blue-100 text-blue-800" },
    outbound:     { label: "Outbound",     className: "bg-purple-100 text-purple-800" },
    detected:     { label: "Detected",     className: "bg-cyan-100 text-cyan-800" },
    "zone-transfer":{ label: "Transfer",  className: "bg-amber-100 text-amber-800" },
    rack:         { label: "Rack",         className: "bg-blue-100 text-blue-800" },
    room:         { label: "Room",         className: "bg-indigo-100 text-indigo-800" },
    door:         { label: "Door",         className: "bg-orange-100 text-orange-800" },
    conveyor:     { label: "Conveyor",     className: "bg-teal-100 text-teal-800" },
    "cold-storage":{ label: "Cold",       className: "bg-cyan-100 text-cyan-800" },
    quarantine:   { label: "Quarantine",   className: "bg-red-100 text-red-800" },
  };
  const cfg = map[status] || { label: status, className: "bg-gray-100 text-gray-600" };
  return <Badge className={`${cfg.className} border-0 text-xs font-medium`}>{cfg.label}</Badge>;
}

function ts(d: Date | string | null | undefined) {
  if (!d) return "—";
  return format(new Date(d), "MMM d, HH:mm");
}

function vendorColor(vendor: string) {
  const map: Record<string, string> = {
    Zebra: "bg-blue-600", Impinj: "bg-green-600", Alien: "bg-purple-600",
    Honeywell: "bg-red-600", Feig: "bg-orange-600", "Nordic ID": "bg-teal-600",
  };
  return map[vendor] || "bg-gray-600";
}

// ==================== Add Zone Dialog ====================

const zoneFormSchema = insertRfidZoneSchema.extend({
  zoneCode: z.string().min(2, "Zone code required"),
  name: z.string().min(2, "Name required"),
  type: z.string().min(1, "Type required"),
});

function AddZoneDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof zoneFormSchema>>({ resolver: zodResolver(zoneFormSchema), defaultValues: { zoneCode: "", name: "", type: "rack", warehouseId: "", locationCode: "", description: "" } });

  const mutation = useMutation({
    mutationFn: (data: InsertRfidZone) => apiRequest("POST", "/api/rfid/zones", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rfid/zones"] });
      toast({ title: "Zone created successfully" });
      form.reset();
      onClose();
    },
    onError: () => toast({ title: "Failed to create zone", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add RFID Zone</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="zoneCode" render={({ field }) => (
                <FormItem><FormLabel>Zone Code</FormLabel><FormControl><Input placeholder="ZONE-RM-A" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {["rack","room","door","conveyor","cold-storage","quarantine"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Zone Name</FormLabel><FormControl><Input placeholder="Raw Materials Rack A" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="warehouseId" render={({ field }) => (
                <FormItem><FormLabel>Warehouse ID</FormLabel><FormControl><Input placeholder="WH-001" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="locationCode" render={({ field }) => (
                <FormItem><FormLabel>Location Code</FormLabel><FormControl><Input placeholder="A-01" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={2} {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Creating…" : "Create Zone"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Add Reader Dialog ====================

const readerFormSchema = insertRfidReaderSchema.extend({
  readerCode: z.string().min(2),
  name: z.string().min(2),
  model: z.string().min(1),
  vendor: z.string().min(1),
});

function AddReaderDialog({ open, onClose, zones }: { open: boolean; onClose: () => void; zones: RfidZone[] }) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof readerFormSchema>>({
    resolver: zodResolver(readerFormSchema),
    defaultValues: { readerCode: "", name: "", model: "", vendor: "Zebra", ipAddress: "", port: 5084, antennaCount: 4, status: "offline" },
  });

  const mutation = useMutation({
    mutationFn: (data: InsertRfidReader) => apiRequest("POST", "/api/rfid/readers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rfid/readers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rfid/stats"] });
      toast({ title: "Reader registered successfully" });
      form.reset();
      onClose();
    },
    onError: () => toast({ title: "Failed to register reader", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Register RFID Reader</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="readerCode" render={({ field }) => (
                <FormItem><FormLabel>Reader Code</FormLabel><FormControl><Input placeholder="RDR-008" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="vendor" render={({ field }) => (
                <FormItem><FormLabel>Vendor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {["Zebra","Impinj","Alien","Honeywell","Feig","Nordic ID"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Reader Name</FormLabel><FormControl><Input placeholder="Zebra FX9600 - Zone C" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="model" render={({ field }) => (
              <FormItem><FormLabel>Model</FormLabel><FormControl><Input placeholder="FX9600" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="zoneId" render={({ field }) => (
              <FormItem><FormLabel>Zone Assignment</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select zone…" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {zones.map(z => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="ipAddress" render={({ field }) => (
                <FormItem><FormLabel>IP Address</FormLabel><FormControl><Input placeholder="192.168.1.108" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="port" render={({ field }) => (
                <FormItem><FormLabel>Port</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="antennaCount" render={({ field }) => (
                <FormItem><FormLabel>Antennas</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Registering…" : "Register Reader"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Add Tag Dialog ====================

const tagFormSchema = insertRfidTagSchema.extend({
  tagEpc: z.string().min(4, "EPC required"),
});

function AddTagDialog({ open, onClose, zones, readers }: { open: boolean; onClose: () => void; zones: RfidZone[]; readers: RfidReader[] }) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof tagFormSchema>>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: { tagEpc: "", tagType: "UHF", materialType: "raw-material", batchNumber: "", lotNumber: "", status: "active" },
  });

  const mutation = useMutation({
    mutationFn: (data: InsertRfidTag) => apiRequest("POST", "/api/rfid/tags", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rfid/tags"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rfid/stats"] });
      toast({ title: "Tag registered successfully" });
      form.reset();
      onClose();
    },
    onError: () => toast({ title: "Failed to register tag", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Register RFID Tag</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-4">
            <FormField control={form.control} name="tagEpc" render={({ field }) => (
              <FormItem><FormLabel>Tag EPC</FormLabel><FormControl><Input placeholder="E2000018921802180C006031" {...field} className="font-mono text-sm" /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="tagType" render={({ field }) => (
                <FormItem><FormLabel>Tag Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {["UHF","HF","LF"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="materialType" render={({ field }) => (
                <FormItem><FormLabel>Material Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {["raw-material","packaging","artwork","finished-product","instructions"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="batchNumber" render={({ field }) => (
                <FormItem><FormLabel>Batch Number</FormLabel><FormControl><Input placeholder="BT-2024-005" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="lotNumber" render={({ field }) => (
                <FormItem><FormLabel>Lot Number</FormLabel><FormControl><Input placeholder="LOT-005" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="lastZoneId" render={({ field }) => (
              <FormItem><FormLabel>Current Zone</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select zone…" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {zones.map(z => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Registering…" : "Register Tag"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Log Movement Dialog ====================

const eventFormSchema = insertRfidEventSchema.extend({
  eventNumber: z.string().min(2),
  tagEpc: z.string().min(4),
  eventType: z.string().min(1),
});

function LogMovementDialog({ open, onClose, zones, readers, tags }: { open: boolean; onClose: () => void; zones: RfidZone[]; readers: RfidReader[]; tags: RfidTag[] }) {
  const { toast } = useToast();
  const eventNum = `RFID-EVT-${String(Math.floor(Math.random() * 90000) + 10000)}`;
  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: { eventNumber: eventNum, tagEpc: "", eventType: "inbound", direction: "in", quantity: 1, performedBy: "Operator" },
  });

  const eventType = form.watch("eventType");

  const mutation = useMutation({
    mutationFn: (data: InsertRfidEvent) => apiRequest("POST", "/api/rfid/events", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rfid/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rfid/stats"] });
      toast({ title: "Movement logged successfully" });
      form.reset({ eventNumber: `RFID-EVT-${String(Math.floor(Math.random() * 90000) + 10000)}`, tagEpc: "", eventType: "inbound", direction: "in", quantity: 1, performedBy: "Operator" });
      onClose();
    },
    onError: () => toast({ title: "Failed to log movement", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Log RFID Movement</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="eventNumber" render={({ field }) => (
                <FormItem><FormLabel>Event Number</FormLabel><FormControl><Input {...field} className="font-mono text-sm" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="eventType" render={({ field }) => (
                <FormItem><FormLabel>Event Type</FormLabel>
                  <Select onValueChange={(v) => { field.onChange(v); form.setValue("direction", v === "inbound" ? "in" : v === "outbound" ? "out" : null as any); }} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {["inbound","outbound","detected","zone-transfer"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="tagEpc" render={({ field }) => (
              <FormItem><FormLabel>Tag EPC</FormLabel>
                <Select onValueChange={(v) => { field.onChange(v); }} value={field.value || ""}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select or type EPC…" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {tags.map(t => <SelectItem key={t.id} value={t.tagEpc}><span className="font-mono text-xs">{t.tagEpc}</span><span className="ml-2 text-gray-500">{t.batchNumber}</span></SelectItem>)}
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="zoneId" render={({ field }) => (
                <FormItem><FormLabel>{eventType === "zone-transfer" ? "To Zone" : "Zone"}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select zone…" /></SelectTrigger></FormControl>
                    <SelectContent>{zones.map(z => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="readerId" render={({ field }) => (
                <FormItem><FormLabel>Reader</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select reader…" /></SelectTrigger></FormControl>
                    <SelectContent>{readers.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
            </div>
            {eventType === "zone-transfer" && (
              <FormField control={form.control} name="fromZoneId" render={({ field }) => (
                <FormItem><FormLabel>From Zone</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select source zone…" /></SelectTrigger></FormControl>
                    <SelectContent>{zones.map(z => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
            )}
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="performedBy" render={({ field }) => (
                <FormItem><FormLabel>Performed By</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea rows={2} {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Logging…" : "Log Movement"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Main Page ====================

export default function RfidTracking() {
  const { toast } = useToast();
  const [addZone, setAddZone] = useState(false);
  const [addReader, setAddReader] = useState(false);
  const [addTag, setAddTag] = useState(false);
  const [logMovement, setLogMovement] = useState(false);
  const [eventFilter, setEventFilter] = useState<string>("all");

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<{ totalReaders: number; onlineReaders: number; activeTags: number; todayEvents: number; inboundToday: number; outboundToday: number }>({
    queryKey: ["/api/rfid/stats"],
  });

  const { data: zones = [], isLoading: zonesLoading } = useQuery<RfidZone[]>({ queryKey: ["/api/rfid/zones"] });
  const { data: readers = [], isLoading: readersLoading } = useQuery<RfidReader[]>({ queryKey: ["/api/rfid/readers"] });
  const { data: tags = [], isLoading: tagsLoading } = useQuery<RfidTag[]>({ queryKey: ["/api/rfid/tags"] });
  const { data: events = [], isLoading: eventsLoading, refetch: refetchEvents } = useQuery<RfidEvent[]>({ queryKey: ["/api/rfid/events"] });

  const deleteReader = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/rfid/readers/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/rfid/readers"] }); queryClient.invalidateQueries({ queryKey: ["/api/rfid/stats"] }); toast({ title: "Reader removed" }); },
  });

  const deleteTag = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/rfid/tags/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/rfid/tags"] }); queryClient.invalidateQueries({ queryKey: ["/api/rfid/stats"] }); toast({ title: "Tag removed" }); },
  });

  const deleteZone = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/rfid/zones/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/rfid/zones"] }); toast({ title: "Zone removed" }); },
  });

  const filteredEvents = events.filter(e => eventFilter === "all" || e.eventType === eventFilter);

  const zoneMap = Object.fromEntries(zones.map(z => [z.id, z]));
  const readerMap = Object.fromEntries(readers.map(r => [r.id, r]));
  const tagMap = Object.fromEntries(tags.map(t => [t.id, t]));

  const onlineCount = readers.filter(r => r.status === "online").length;
  const offlineCount = readers.filter(r => r.status !== "online").length;

  function handleRefresh() {
    refetchStats();
    refetchEvents();
    queryClient.invalidateQueries({ queryKey: ["/api/rfid/tags"] });
    toast({ title: "Data refreshed" });
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-600" />
              RFID Inventory Tracking
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Real-time RFID monitoring across all warehouse zones</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setLogMovement(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Log Movement
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Total Readers", value: stats?.totalReaders ?? "—", icon: Radio, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Online", value: stats?.onlineReaders ?? "—", icon: Wifi, color: "text-green-600", bg: "bg-green-50" },
              { label: "Active Tags", value: stats?.activeTags ?? "—", icon: Tag, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Events Today", value: stats?.todayEvents ?? "—", icon: Activity, color: "text-gray-600", bg: "bg-gray-50" },
              { label: "Inbound Today", value: stats?.inboundToday ?? "—", icon: ArrowDownCircle, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Outbound Today", value: stats?.outboundToday ?? "—", icon: ArrowUpCircle, color: "text-orange-600", bg: "bg-orange-50" },
            ].map(s => (
              <Card key={s.label} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{statsLoading ? "…" : s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="monitor">
            <TabsList className="bg-white border">
              <TabsTrigger value="monitor" className="flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> Live Monitor
              </TabsTrigger>
              <TabsTrigger value="readers" className="flex items-center gap-1.5">
                <Radio className="w-4 h-4" /> Readers ({readers.length})
              </TabsTrigger>
              <TabsTrigger value="tags" className="flex items-center gap-1.5">
                <Tag className="w-4 h-4" /> Tag Registry ({tags.length})
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Movement Log ({events.length})
              </TabsTrigger>
            </TabsList>

            {/* ========== LIVE MONITOR ========== */}
            <TabsContent value="monitor" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Reader Health */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Radio className="w-4 h-4 text-blue-600" /> Reader Health Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {readersLoading ? (
                      <div className="text-sm text-gray-400">Loading…</div>
                    ) : readers.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${vendorColor(r.vendor)}`}>
                            {r.vendor[0]}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{r.name}</div>
                            <div className="text-xs text-gray-500">{r.model} · {r.ipAddress || "No IP"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {r.status === "online" ? <Wifi className="w-4 h-4 text-green-500" /> : r.status === "error" ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <WifiOff className="w-4 h-4 text-gray-400" />}
                          {statusBadge(r.status)}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Zone Map */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-600" /> Zone Activity Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {zonesLoading ? (
                        <div className="text-sm text-gray-400">Loading…</div>
                      ) : zones.map(zone => {
                        const zoneReaders = readers.filter(r => r.zoneId === zone.id);
                        const zoneTags = tags.filter(t => t.lastZoneId === zone.id);
                        const zoneEvents = events.filter(e => e.zoneId === zone.id).length;
                        const hasOnlineReader = zoneReaders.some(r => r.status === "online");
                        return (
                          <div key={zone.id} className={`p-3 rounded-lg border-2 ${hasOnlineReader ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className={`w-2 h-2 rounded-full ${hasOnlineReader ? "bg-green-500" : "bg-gray-400"}`} />
                              <span className="text-xs font-semibold text-gray-800 truncate">{zone.name}</span>
                            </div>
                            <div className="text-xs text-gray-500">{statusBadge(zone.type)}</div>
                            <div className="mt-2 flex gap-3 text-xs text-gray-600">
                              <span><Radio className="w-3 h-3 inline mr-0.5" />{zoneReaders.length}</span>
                              <span><Tag className="w-3 h-3 inline mr-0.5" />{zoneTags.length}</span>
                              <span><Activity className="w-3 h-3 inline mr-0.5" />{zoneEvents}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Events */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" /> Recent Scan Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event #</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Tag EPC</TableHead>
                        <TableHead>Zone</TableHead>
                        <TableHead>Reader</TableHead>
                        <TableHead>Material Type</TableHead>
                        <TableHead>RSSI</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventsLoading ? (
                        <TableRow><TableCell colSpan={8} className="text-center text-sm text-gray-400 py-8">Loading events…</TableCell></TableRow>
                      ) : events.slice(0, 10).map(ev => (
                        <TableRow key={ev.id}>
                          <TableCell className="font-mono text-xs">{ev.eventNumber}</TableCell>
                          <TableCell>{statusBadge(ev.eventType)}</TableCell>
                          <TableCell className="font-mono text-xs">{ev.tagEpc.slice(-8)}</TableCell>
                          <TableCell className="text-xs">{ev.zoneId ? zoneMap[ev.zoneId]?.name || "—" : "—"}</TableCell>
                          <TableCell className="text-xs">{ev.readerId ? readerMap[ev.readerId]?.readerCode || "—" : "—"}</TableCell>
                          <TableCell className="text-xs">{ev.materialType || "—"}</TableCell>
                          <TableCell className="text-xs">{ev.rssi ? `${ev.rssi} dBm` : "—"}</TableCell>
                          <TableCell className="text-xs text-gray-500">{ts(ev.scannedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ========== READERS ========== */}
            <TabsContent value="readers" className="mt-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold">RFID Scanner Devices</CardTitle>
                  <Button size="sm" onClick={() => setAddReader(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Add Reader
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name / Model</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Zone</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Antennas</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Heartbeat</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {readersLoading ? (
                        <TableRow><TableCell colSpan={9} className="text-center text-sm text-gray-400 py-8">Loading readers…</TableCell></TableRow>
                      ) : readers.map(r => (
                        <TableRow key={r.id}>
                          <TableCell className="font-mono text-xs font-semibold">{r.readerCode}</TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{r.name}</div>
                            <div className="text-xs text-gray-500">{r.model}</div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${vendorColor(r.vendor)}`}>{r.vendor}</span>
                          </TableCell>
                          <TableCell className="text-xs">{r.zoneId ? zoneMap[r.zoneId]?.name || "—" : "—"}</TableCell>
                          <TableCell className="font-mono text-xs">{r.ipAddress || "—"}:{r.port}</TableCell>
                          <TableCell className="text-center">{r.antennaCount}</TableCell>
                          <TableCell>{statusBadge(r.status)}</TableCell>
                          <TableCell className="text-xs text-gray-500">{ts(r.lastHeartbeat)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 h-7 w-7 p-0" onClick={() => deleteReader.mutate(r.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Zones Section */}
              <Card className="border-0 shadow-sm mt-4">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold">RFID Monitoring Zones</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setAddZone(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Add Zone
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Zone Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Warehouse</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {zonesLoading ? (
                        <TableRow><TableCell colSpan={7} className="text-center text-sm text-gray-400 py-8">Loading zones…</TableCell></TableRow>
                      ) : zones.map(z => (
                        <TableRow key={z.id}>
                          <TableCell className="font-mono text-xs font-semibold">{z.zoneCode}</TableCell>
                          <TableCell className="font-medium text-sm">{z.name}</TableCell>
                          <TableCell>{statusBadge(z.type)}</TableCell>
                          <TableCell className="text-xs">{z.warehouseId || "—"}</TableCell>
                          <TableCell className="font-mono text-xs">{z.locationCode || "—"}</TableCell>
                          <TableCell className="text-xs text-gray-500 max-w-xs truncate">{z.description || "—"}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 h-7 w-7 p-0" onClick={() => deleteZone.mutate(z.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ========== TAG REGISTRY ========== */}
            <TabsContent value="tags" className="mt-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold">RFID Tag Registry</CardTitle>
                  <Button size="sm" onClick={() => setAddTag(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Register Tag
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tag EPC</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Material Type</TableHead>
                        <TableHead>Batch / Lot</TableHead>
                        <TableHead>Last Zone</TableHead>
                        <TableHead>Last Reader</TableHead>
                        <TableHead>RSSI</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Seen</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tagsLoading ? (
                        <TableRow><TableCell colSpan={10} className="text-center text-sm text-gray-400 py-8">Loading tags…</TableCell></TableRow>
                      ) : tags.map(t => (
                        <TableRow key={t.id}>
                          <TableCell className="font-mono text-xs">{t.tagEpc.slice(-12)}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{t.tagType}</Badge></TableCell>
                          <TableCell className="text-xs">{t.materialType || "—"}</TableCell>
                          <TableCell>
                            <div className="text-xs font-medium">{t.batchNumber || "—"}</div>
                            <div className="text-xs text-gray-400">{t.lotNumber || ""}</div>
                          </TableCell>
                          <TableCell className="text-xs">{t.lastZoneId ? zoneMap[t.lastZoneId]?.name || "—" : "—"}</TableCell>
                          <TableCell className="text-xs">{t.lastReaderId ? readerMap[t.lastReaderId]?.readerCode || "—" : "—"}</TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-1">
                              <Signal className="w-3 h-3 text-gray-400" />
                              {t.lastRssi ? `${t.lastRssi} dBm` : "—"}
                            </div>
                          </TableCell>
                          <TableCell>{statusBadge(t.status)}</TableCell>
                          <TableCell className="text-xs text-gray-500">{ts(t.lastSeenAt)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 h-7 w-7 p-0" onClick={() => deleteTag.mutate(t.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ========== MOVEMENT LOG ========== */}
            <TabsContent value="events" className="mt-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Movement Event Log</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={eventFilter} onValueChange={setEventFilter}>
                      <SelectTrigger className="w-36 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="inbound">Inbound</SelectItem>
                        <SelectItem value="outbound">Outbound</SelectItem>
                        <SelectItem value="detected">Detected</SelectItem>
                        <SelectItem value="zone-transfer">Zone Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={() => setLogMovement(true)}>
                      <Plus className="w-4 h-4 mr-1" /> Log Movement
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event #</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Tag EPC</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>From Zone</TableHead>
                        <TableHead>To Zone / Zone</TableHead>
                        <TableHead>Reader</TableHead>
                        <TableHead>RSSI</TableHead>
                        <TableHead>Performed By</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventsLoading ? (
                        <TableRow><TableCell colSpan={10} className="text-center text-sm text-gray-400 py-8">Loading events…</TableCell></TableRow>
                      ) : filteredEvents.length === 0 ? (
                        <TableRow><TableCell colSpan={10} className="text-center text-sm text-gray-400 py-8">No events found</TableCell></TableRow>
                      ) : filteredEvents.map(ev => (
                        <TableRow key={ev.id}>
                          <TableCell className="font-mono text-xs">{ev.eventNumber}</TableCell>
                          <TableCell>{statusBadge(ev.eventType)}</TableCell>
                          <TableCell className="font-mono text-xs">{ev.tagEpc.slice(-12)}</TableCell>
                          <TableCell className="text-xs">{ev.batchNumber || "—"}</TableCell>
                          <TableCell className="text-xs">{ev.fromZoneId ? zoneMap[ev.fromZoneId]?.name || "—" : "—"}</TableCell>
                          <TableCell className="text-xs">{ev.zoneId ? zoneMap[ev.zoneId]?.name || "—" : "—"}</TableCell>
                          <TableCell className="text-xs">{ev.readerId ? readerMap[ev.readerId]?.readerCode || "—" : "—"}</TableCell>
                          <TableCell className="text-xs">{ev.rssi ? `${ev.rssi} dBm` : "—"}</TableCell>
                          <TableCell className="text-xs">{ev.performedBy || "System"}</TableCell>
                          <TableCell className="text-xs text-gray-500">{ts(ev.scannedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialogs */}
      <AddZoneDialog open={addZone} onClose={() => setAddZone(false)} />
      <AddReaderDialog open={addReader} onClose={() => setAddReader(false)} zones={zones} />
      <AddTagDialog open={addTag} onClose={() => setAddTag(false)} zones={zones} readers={readers} />
      <LogMovementDialog open={logMovement} onClose={() => setLogMovement(false)} zones={zones} readers={readers} tags={tags} />
    </div>
  );
}
