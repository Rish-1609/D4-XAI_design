import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Settings2, Wrench, CheckCircle2, AlertTriangle, Clock, Edit2 } from "lucide-react";

// SOP: EQP-001 — Equipment Master Management; doc rev 2.0 approved QA/Engineering 2026-01-10

type Equipment = {
  id: string;
  equipmentId: string;
  name: string;
  department: string;
  type: string;
  make?: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  capacity?: string;
  capacityUom?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  lastCalibrationDate?: string;
  nextCalibrationDate?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  status: string;
  notes?: string;
};

const SEED: Equipment[] = [
  { id: "eq1",  equipmentId: "EQP-001", name: "FLUID BED DRYER",           department: "Production",   type: "Drying",         make: "Glatt GmbH",        model: "GPCG-120",     serialNumber: "GFB-2019-0042", location: "Block-A, Mfg Floor 1", capacity: "120", capacityUom: "kg/batch", lastMaintenanceDate: "2026-02-10", nextMaintenanceDate: "2026-08-10", lastCalibrationDate: "2026-01-05", nextCalibrationDate: "2026-07-05", purchaseDate: "2019-06-15", warrantyExpiry: "2022-06-15", status: "operational", notes: "Used for granule drying. Calibrated as per SOP EQP-CAL-003." },
  { id: "eq2",  equipmentId: "EQP-002", name: "HIGH SHEAR GRANULATOR",     department: "Production",   type: "Granulation",    make: "Diosna",            model: "P-250",        serialNumber: "DHS-2020-0011", location: "Block-A, Mfg Floor 1", capacity: "250", capacityUom: "L", lastMaintenanceDate: "2026-03-01", nextMaintenanceDate: "2026-09-01", lastCalibrationDate: "2026-02-10", nextCalibrationDate: "2026-08-10", purchaseDate: "2020-02-20", warrantyExpiry: "2023-02-20", status: "operational", notes: "Routine PM every 6 months" },
  { id: "eq3",  equipmentId: "EQP-003", name: "TABLET COMPRESSION MACHINE",department: "Production",   type: "Compression",    make: "Fette Compacting",  model: "FE55",         serialNumber: "FCM-2021-0003", location: "Block-B, Compression Suite", capacity: "280000", capacityUom: "tabs/hr", lastMaintenanceDate: "2026-01-20", nextMaintenanceDate: "2026-07-20", lastCalibrationDate: "2026-01-20", nextCalibrationDate: "2026-07-20", purchaseDate: "2021-04-10", warrantyExpiry: "2024-04-10", status: "operational", notes: "36-station rotary press; IPC done every 30 min during run." },
  { id: "eq4",  equipmentId: "EQP-004", name: "BLISTER PACKING MACHINE",   department: "Packing",      type: "Packaging",      make: "Uhlmann",           model: "UPS-4",        serialNumber: "UBP-2022-0007", location: "Block-C, Primary Packing", capacity: "22000", capacityUom: "blisters/hr", lastMaintenanceDate: "2026-02-28", nextMaintenanceDate: "2026-08-28", lastCalibrationDate: "2026-02-28", nextCalibrationDate: "2026-08-28", purchaseDate: "2022-07-01", warrantyExpiry: "2025-07-01", status: "operational", notes: "PVC/PVDC and Alu-Alu formats" },
  { id: "eq5",  equipmentId: "EQP-005", name: "AUTOCLAVE (STEAM STERILIZER)",department: "QC/Sterile", type: "Sterilization",  make: "BELIMED",           model: "WD-290",       serialNumber: "BAC-2018-0002", location: "QC Lab, Sterility Suite", capacity: "290", capacityUom: "L", lastMaintenanceDate: "2026-01-15", nextMaintenanceDate: "2026-04-15", lastCalibrationDate: "2026-01-15", nextCalibrationDate: "2026-04-15", purchaseDate: "2018-09-22", warrantyExpiry: "2021-09-22", status: "operational", notes: "Bowie-Dick test daily; quarterly re-validation." },
  { id: "eq6",  equipmentId: "EQP-006", name: "HPLC SYSTEM",               department: "QC",           type: "Analytical",     make: "Waters Corporation",model: "Alliance e2695",serialNumber: "WAT-2020-0015", location: "QC Lab, Chromatography Room", capacity: "—", capacityUom: "—", lastMaintenanceDate: "2026-03-10", nextMaintenanceDate: "2026-09-10", lastCalibrationDate: "2026-03-01", nextCalibrationDate: "2026-06-01", purchaseDate: "2020-11-01", warrantyExpiry: "2023-11-01", status: "operational", notes: "Empower 3 software; SST run each day of use." },
  { id: "eq7",  equipmentId: "EQP-007", name: "DISSOLUTION TESTER",        department: "QC",           type: "Analytical",     make: "Electrolab",        model: "TDT-08L",      serialNumber: "ELT-2021-0009", location: "QC Lab, Dissolution Room", capacity: "8", capacityUom: "vessels", lastMaintenanceDate: "2026-02-20", nextMaintenanceDate: "2026-08-20", lastCalibrationDate: "2026-02-15", nextCalibrationDate: "2026-08-15", purchaseDate: "2021-03-05", warrantyExpiry: "2024-03-05", status: "operational", notes: "Calibrated with salicylic acid and prednisolone tablets per USP." },
  { id: "eq8",  equipmentId: "EQP-008", name: "COATING MACHINE",           department: "Production",   type: "Coating",        make: "O'Hara Technologies",model: "LabCoat-II",  serialNumber: "OHC-2020-0005", location: "Block-A, Coating Suite", capacity: "200", capacityUom: "kg/batch", lastMaintenanceDate: "2026-01-30", nextMaintenanceDate: "2026-07-30", lastCalibrationDate: "2026-01-10", nextCalibrationDate: "2026-07-10", purchaseDate: "2020-08-14", warrantyExpiry: "2023-08-14", status: "under_maintenance", notes: "Currently under PM — spray nozzle replacement. ETA: 2026-04-02." },
  { id: "eq9",  equipmentId: "EQP-009", name: "CAPSULE FILLING MACHINE",   department: "Production",   type: "Filling",        make: "IMA Active",        model: "IMA 150",      serialNumber: "IMA-2019-0008", location: "Block-B, Capsule Suite", capacity: "150000", capacityUom: "caps/hr", lastMaintenanceDate: "2026-03-05", nextMaintenanceDate: "2026-09-05", lastCalibrationDate: "2026-03-05", nextCalibrationDate: "2026-09-05", purchaseDate: "2019-12-10", warrantyExpiry: "2022-12-10", status: "operational", notes: "Size 0, 1, 2 and 00 size moulds available." },
  { id: "eq10", equipmentId: "EQP-010", name: "BALANCE (PRECISION 0.1mg)", department: "QC",           type: "Weighing",       make: "Mettler Toledo",    model: "XPE205",       serialNumber: "MTB-2022-0020", location: "QC Lab, Balance Room", capacity: "220", capacityUom: "g", lastMaintenanceDate: "2026-03-15", nextMaintenanceDate: "2026-06-15", lastCalibrationDate: "2026-03-15", nextCalibrationDate: "2026-06-15", purchaseDate: "2022-01-15", warrantyExpiry: "2025-01-15", status: "calibration_due", notes: "Calibration overdue — schedule NABL lab visit. Ref SOP QC-CAL-001." },
  { id: "eq11", equipmentId: "EQP-011", name: "ENVIRONMENTAL MONITORING SYSTEM", department: "Quality Assurance", type: "Monitoring", make: "Lighthouse", model: "SOLAIR 3100", serialNumber: "LHS-2021-0004", location: "All manufacturing areas", capacity: "—", capacityUom: "—", lastMaintenanceDate: "2026-02-01", nextMaintenanceDate: "2026-08-01", lastCalibrationDate: "2026-02-01", nextCalibrationDate: "2026-08-01", purchaseDate: "2021-06-20", warrantyExpiry: "2024-06-20", status: "operational", notes: "Particle counter network; alert limits 3520 / 352 per m³ for Class D/C." },
  { id: "eq12", equipmentId: "EQP-012", name: "STABILITY CHAMBER",         department: "QC",           type: "Storage/Testing",make: "Thermolab Scientific",model: "LTS-500",     serialNumber: "TLS-2020-0013", location: "QC Lab, Stability Room", capacity: "500", capacityUom: "L", lastMaintenanceDate: "2026-01-25", nextMaintenanceDate: "2026-07-25", lastCalibrationDate: "2026-01-25", nextCalibrationDate: "2026-07-25", purchaseDate: "2020-05-18", warrantyExpiry: "2023-05-18", status: "operational", notes: "ICH conditions 25°C/60% RH and 40°C/75% RH zones." },
];

const statusConfig: Record<string, { label: string; icon: any; cls: string }> = {
  operational:       { label: "Operational",       icon: CheckCircle2,  cls: "bg-emerald-100 text-emerald-700" },
  under_maintenance: { label: "Under Maintenance",  icon: Wrench,        cls: "bg-amber-100 text-amber-700" },
  calibration_due:   { label: "Calibration Due",    icon: AlertTriangle, cls: "bg-red-100 text-red-700" },
  decommissioned:    { label: "Decommissioned",     icon: Clock,         cls: "bg-gray-100 text-gray-600" },
};

const StatusBadge = ({ s }: { s: string }) => {
  const cfg = statusConfig[s] ?? { label: s, icon: Settings2, cls: "bg-gray-100 text-gray-700" };
  const Icon = cfg.icon;
  return <Badge className={`border-0 text-xs flex items-center gap-1 w-fit ${cfg.cls}`}><Icon className="w-3 h-3" />{cfg.label}</Badge>;
};

const daysUntil = (d?: string) => {
  if (!d) return null;
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  return diff;
};

export default function MasterEquipment() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Equipment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const filtered = SEED.filter(e => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.equipmentId.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || e.department === deptFilter;
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const depts = [...new Set(SEED.map(e => e.department))];
  const operational = SEED.filter(e => e.status === "operational").length;
  const underMaintenance = SEED.filter(e => e.status === "under_maintenance").length;
  const calibrationDue = SEED.filter(e => e.status === "calibration_due" || (daysUntil(e.nextCalibrationDate) ?? 999) < 30).length;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Equipment Management</h1>
          <p className="text-muted-foreground text-sm">Equipment master registry — SOP: EQP-001</p>
        </div>
        <Button onClick={() => toast({ title: "Coming soon", description: "New equipment form in next release." })}>
          <Plus className="w-4 h-4 mr-2" /> Add Equipment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Equipment", value: SEED.length,        icon: Settings2,    color: "text-blue-600" },
          { label: "Operational",     value: operational,         icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Under Maintenance",value: underMaintenance,  icon: Wrench,       color: "text-amber-600" },
          { label: "Calibration Due", value: calibrationDue,     icon: AlertTriangle,color: "text-red-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </div>
                <Icon className={`w-8 h-8 ${color} opacity-20`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search equipment…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-52"><SelectValue placeholder="All Departments" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {depts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="operational">Operational</SelectItem>
            <SelectItem value="under_maintenance">Under Maintenance</SelectItem>
            <SelectItem value="calibration_due">Calibration Due</SelectItem>
            <SelectItem value="decommissioned">Decommissioned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Equipment Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Make / Model</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Next Maintenance</TableHead>
                <TableHead>Next Calibration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No equipment found.</TableCell></TableRow>
              ) : filtered.map(e => {
                const maintDays = daysUntil(e.nextMaintenanceDate);
                const calDays = daysUntil(e.nextCalibrationDate);
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs font-semibold">{e.equipmentId}</TableCell>
                    <TableCell>
                      <div className="font-medium">{e.name}</div>
                      <div className="text-xs text-muted-foreground">S/N: {e.serialNumber ?? "—"}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{e.department}</Badge></TableCell>
                    <TableCell className="text-sm">{e.type}</TableCell>
                    <TableCell className="text-sm">
                      <div>{e.make}</div>
                      <div className="text-xs text-muted-foreground">{e.model}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{e.location ?? "—"}</TableCell>
                    <TableCell>
                      <div className="text-xs">{e.nextMaintenanceDate ?? "—"}</div>
                      {maintDays !== null && (
                        <div className={`text-xs font-medium ${maintDays < 0 ? "text-red-600" : maintDays < 30 ? "text-amber-600" : "text-emerald-600"}`}>
                          {maintDays < 0 ? `${-maintDays}d overdue` : `${maintDays}d remaining`}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">{e.nextCalibrationDate ?? "—"}</div>
                      {calDays !== null && (
                        <div className={`text-xs font-medium ${calDays < 0 ? "text-red-600" : calDays < 30 ? "text-amber-600" : "text-emerald-600"}`}>
                          {calDays < 0 ? `${-calDays}d overdue` : `${calDays}d remaining`}
                        </div>
                      )}
                    </TableCell>
                    <TableCell><StatusBadge s={e.status} /></TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => { setSelected(e); setDialogOpen(true); }}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{selected?.equipmentId} — {selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Department", selected.department],
                  ["Type", selected.type],
                  ["Make", selected.make ?? "—"],
                  ["Model", selected.model ?? "—"],
                  ["Serial Number", selected.serialNumber ?? "—"],
                  ["Location", selected.location ?? "—"],
                  ["Capacity", `${selected.capacity ?? "—"} ${selected.capacityUom ?? ""}`],
                  ["Purchase Date", selected.purchaseDate ?? "—"],
                  ["Warranty Expiry", selected.warrantyExpiry ?? "—"],
                  ["Last Maintenance", selected.lastMaintenanceDate ?? "—"],
                  ["Next Maintenance", selected.nextMaintenanceDate ?? "—"],
                  ["Last Calibration", selected.lastCalibrationDate ?? "—"],
                  ["Next Calibration", selected.nextCalibrationDate ?? "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-muted-foreground">{k}</p>
                    <p className="font-medium">{v}</p>
                  </div>
                ))}
              </div>
              {selected.notes && (
                <div className="bg-muted/50 rounded p-3">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p>{selected.notes}</p>
                </div>
              )}
              <div><StatusBadge s={selected.status} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
}
