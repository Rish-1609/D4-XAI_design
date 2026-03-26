import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Thermometer, Package, FlaskConical, Layers, ShieldCheck, BookOpen } from "lucide-react";

interface Material {
  code: string; name: string; type: string; category: string;
  uom: string; pharmacopoeialStd: string; storageCondition: string;
  shelfLifeMonths: number; reorderLevel: string; reorderQty: string;
  hsCode: string; casNumber: string; supplierId: string; status: string;
  temperature?: string; schedule?: string; notes?: string;
}

const SEED_MATERIALS: Material[] = [
  // Active Pharmaceutical Ingredients (APIs)
  { code: "RM-001", name: "Ofloxacin IP 200mg", type: "Raw Material", category: "API – Fluoroquinolone", uom: "kg", pharmacopoeialStd: "IP 2022", storageCondition: "Cool & Dry (15–25°C, RH ≤ 65%)", shelfLifeMonths: 36, reorderLevel: "50 kg", reorderQty: "200 kg", hsCode: "2933.59.90", casNumber: "82419-36-1", supplierId: "SUP-005", status: "Active", schedule: "H" },
  { code: "RM-002", name: "Ornidazole IP 500mg", type: "Raw Material", category: "API – Nitroimidazole", uom: "kg", pharmacopoeialStd: "IP 2022", storageCondition: "Cool & Dry (15–25°C, RH ≤ 65%)", shelfLifeMonths: 36, reorderLevel: "40 kg", reorderQty: "150 kg", hsCode: "2933.29.90", casNumber: "16773-42-5", supplierId: "SUP-005", status: "Active", schedule: "H" },
  { code: "RM-3001", name: "Nimesulide 100mg API", type: "Raw Material", category: "API – NSAID", uom: "kg", pharmacopoeialStd: "IP 2022", storageCondition: "Protect from light, cool & dry", shelfLifeMonths: 36, reorderLevel: "30 kg", reorderQty: "120 kg", hsCode: "2935.90.90", casNumber: "51803-78-2", supplierId: "SUP-005", status: "Active", schedule: "H" },
  { code: "RM-3002", name: "Paracetamol 500mg API", type: "Raw Material", category: "API – Analgesic/Antipyretic", uom: "kg", pharmacopoeialStd: "IP 2022 / BP 2023", storageCondition: "Cool & Dry", shelfLifeMonths: 48, reorderLevel: "100 kg", reorderQty: "500 kg", hsCode: "2924.29.39", casNumber: "103-90-2", supplierId: "SUP-006", status: "Active" },
  { code: "RM-4001", name: "Pantoprazole 40mg API", type: "Raw Material", category: "API – PPI (Proton Pump Inhibitor)", uom: "kg", pharmacopoeialStd: "IP 2022", storageCondition: "Cool & Dry, Protect from light (15–25°C)", shelfLifeMonths: 30, reorderLevel: "25 kg", reorderQty: "100 kg", hsCode: "2933.59.90", casNumber: "102625-70-7", supplierId: "SUP-005", status: "Active", schedule: "H" },
  { code: "RM-4002", name: "Domperidone 30mg SR API", type: "Raw Material", category: "API – Prokinetic", uom: "kg", pharmacopoeialStd: "IP 2022", storageCondition: "Cool & Dry (15–25°C, RH ≤ 65%)", shelfLifeMonths: 36, reorderLevel: "20 kg", reorderQty: "80 kg", hsCode: "2934.99.90", casNumber: "57808-66-9", supplierId: "SUP-006", status: "Active", schedule: "H" },
  { code: "RM-5001", name: "Cefixime Trihydrate 200mg API", type: "Raw Material", category: "API – Cephalosporin Antibiotic", uom: "kg", pharmacopoeialStd: "IP 2022 / USP 45", storageCondition: "Refrigerated (2–8°C)", shelfLifeMonths: 24, reorderLevel: "30 kg", reorderQty: "100 kg", hsCode: "2941.90.90", casNumber: "79350-37-1", supplierId: "SUP-005", status: "Active", temperature: "2–8°C", schedule: "H" },
  { code: "RM-6001", name: "Levofloxacin Hemihydrate 500mg API", type: "Raw Material", category: "API – Fluoroquinolone", uom: "kg", pharmacopoeialStd: "IP 2022 / BP 2023", storageCondition: "Cool & Dry (15–25°C)", shelfLifeMonths: 36, reorderLevel: "25 kg", reorderQty: "100 kg", hsCode: "2933.59.90", casNumber: "138199-71-0", supplierId: "SUP-005", status: "Active", schedule: "H" },
  { code: "RM-7001", name: "Metformin HCl 500mg API", type: "Raw Material", category: "API – Biguanide Antidiabetic", uom: "kg", pharmacopoeialStd: "IP 2022 / BP 2023", storageCondition: "Cool & Dry", shelfLifeMonths: 48, reorderLevel: "80 kg", reorderQty: "300 kg", hsCode: "2946.00.20", casNumber: "1115-70-4", supplierId: "SUP-006", status: "Active" },
  { code: "RM-8001", name: "Amoxycillin Trihydrate 500mg API", type: "Raw Material", category: "API – Penicillin Antibiotic", uom: "kg", pharmacopoeialStd: "IP 2022 / BP 2023", storageCondition: "Cool & Dry (≤ 25°C, RH ≤ 60%)", shelfLifeMonths: 24, reorderLevel: "40 kg", reorderQty: "150 kg", hsCode: "2941.10.10", casNumber: "61336-70-7", supplierId: "SUP-005", status: "Active", schedule: "H" },
  { code: "RM-9001", name: "Clavulanic Acid 125mg (as Potassium Salt)", type: "Raw Material", category: "API – Beta-Lactamase Inhibitor", uom: "kg", pharmacopoeialStd: "IP 2022 / BP 2023", storageCondition: "Refrigerated (2–8°C)", shelfLifeMonths: 18, reorderLevel: "20 kg", reorderQty: "60 kg", hsCode: "2941.90.90", casNumber: "61177-45-5", supplierId: "SUP-005", status: "Active", temperature: "2–8°C", schedule: "H" },
  { code: "RM-10001", name: "Atorvastatin Calcium 10mg API", type: "Raw Material", category: "API – Statin (HMG-CoA Reductase Inhibitor)", uom: "kg", pharmacopoeialStd: "IP 2022 / USP 45", storageCondition: "Cool & Dry, Protect from light", shelfLifeMonths: 36, reorderLevel: "15 kg", reorderQty: "60 kg", hsCode: "2933.99.90", casNumber: "134523-03-8", supplierId: "SUP-005", status: "Active", schedule: "H" },
  { code: "RM-11001", name: "Rabeprazole Sodium 20mg API", type: "Raw Material", category: "API – PPI (Proton Pump Inhibitor)", uom: "kg", pharmacopoeialStd: "IP 2022", storageCondition: "Cool & Dry, Protect from moisture (15–25°C)", shelfLifeMonths: 30, reorderLevel: "15 kg", reorderQty: "60 kg", hsCode: "2933.59.90", casNumber: "117976-90-6", supplierId: "SUP-005", status: "Active", schedule: "H" },
  { code: "RM-12001", name: "Domperidone 10mg API", type: "Raw Material", category: "API – Prokinetic / Antiemetic", uom: "kg", pharmacopoeialStd: "IP 2022", storageCondition: "Cool & Dry (15–25°C)", shelfLifeMonths: 36, reorderLevel: "10 kg", reorderQty: "40 kg", hsCode: "2934.99.90", casNumber: "57808-66-9", supplierId: "SUP-006", status: "Active", schedule: "H" },
  { code: "RM-13001", name: "Paracetamol 650mg API", type: "Raw Material", category: "API – Analgesic/Antipyretic", uom: "kg", pharmacopoeialStd: "IP 2022 / BP 2023", storageCondition: "Cool & Dry", shelfLifeMonths: 48, reorderLevel: "120 kg", reorderQty: "600 kg", hsCode: "2924.29.39", casNumber: "103-90-2", supplierId: "SUP-006", status: "Active" },
  // Excipients
  { code: "EX-2001", name: "Microcrystalline Cellulose PH102", type: "Raw Material", category: "Excipient – Diluent/Binder", uom: "kg", pharmacopoeialStd: "IP / NF", storageCondition: "Cool & Dry (≤ 30°C, RH ≤ 75%)", shelfLifeMonths: 60, reorderLevel: "200 kg", reorderQty: "1000 kg", hsCode: "3912.39.20", casNumber: "9004-34-6", supplierId: "SUP-007", status: "Active" },
  { code: "EX-2002", name: "Croscarmellose Sodium (A-Type)", type: "Raw Material", category: "Excipient – Disintegrant", uom: "kg", pharmacopoeialStd: "IP / NF", storageCondition: "Cool & Dry", shelfLifeMonths: 48, reorderLevel: "100 kg", reorderQty: "400 kg", hsCode: "3912.39.20", casNumber: "74811-65-7", supplierId: "SUP-007", status: "Active" },
  { code: "EX-3001", name: "HPMC E5 (Hydroxypropyl Methylcellulose E5)", type: "Raw Material", category: "Excipient – Binder/Coating Agent", uom: "kg", pharmacopoeialStd: "IP / USP", storageCondition: "Cool & Dry (≤ 25°C)", shelfLifeMonths: 60, reorderLevel: "80 kg", reorderQty: "300 kg", hsCode: "3912.31.10", casNumber: "9004-65-3", supplierId: "SUP-007", status: "Active" },
  { code: "EX-4001", name: "Starch Maize IP", type: "Raw Material", category: "Excipient – Diluent/Disintegrant", uom: "kg", pharmacopoeialStd: "IP 2022", storageCondition: "Cool & Dry (≤ 30°C)", shelfLifeMonths: 60, reorderLevel: "150 kg", reorderQty: "600 kg", hsCode: "1108.12.00", casNumber: "9005-25-8", supplierId: "SUP-007", status: "Active" },
  { code: "EX-5001", name: "Magnesium Stearate IP", type: "Raw Material", category: "Excipient – Lubricant", uom: "kg", pharmacopoeialStd: "IP 2022 / NF", storageCondition: "Cool & Dry (≤ 25°C, RH ≤ 60%)", shelfLifeMonths: 60, reorderLevel: "50 kg", reorderQty: "200 kg", hsCode: "2916.19.40", casNumber: "557-04-0", supplierId: "SUP-007", status: "Active" },
  { code: "EX-5002", name: "Talc IP", type: "Raw Material", category: "Excipient – Glidant/Lubricant", uom: "kg", pharmacopoeialStd: "IP 2022 / NF", storageCondition: "Cool & Dry", shelfLifeMonths: 60, reorderLevel: "50 kg", reorderQty: "200 kg", hsCode: "2526.20.00", casNumber: "14807-96-6", supplierId: "SUP-007", status: "Active" },
  { code: "EX-5003", name: "Colloidal Silicon Dioxide (Aerosil 200)", type: "Raw Material", category: "Excipient – Glidant", uom: "kg", pharmacopoeialStd: "IP / NF", storageCondition: "Cool & Dry (RH ≤ 65%)", shelfLifeMonths: 60, reorderLevel: "30 kg", reorderQty: "100 kg", hsCode: "2811.22.20", casNumber: "7631-86-9", supplierId: "SUP-007", status: "Active" },
  { code: "EX-6001", name: "Lactose Monohydrate 200M", type: "Raw Material", category: "Excipient – Diluent", uom: "kg", pharmacopoeialStd: "IP 2022 / NF", storageCondition: "Cool & Dry (RH ≤ 60%)", shelfLifeMonths: 60, reorderLevel: "100 kg", reorderQty: "400 kg", hsCode: "1702.19.20", casNumber: "64044-51-5", supplierId: "SUP-007", status: "Active" },
  { code: "EX-6002", name: "PVP K30 (Povidone K30)", type: "Raw Material", category: "Excipient – Binder", uom: "kg", pharmacopoeialStd: "IP / NF", storageCondition: "Cool & Dry (≤ 25°C, RH ≤ 65%)", shelfLifeMonths: 36, reorderLevel: "30 kg", reorderQty: "100 kg", hsCode: "3905.30.00", casNumber: "9003-39-8", supplierId: "SUP-007", status: "Active" },
  { code: "EX-7001", name: "Isomalt DC (Sugar-Free Diluent)", type: "Raw Material", category: "Excipient – Sugar Alcohol Diluent", uom: "kg", pharmacopoeialStd: "NF", storageCondition: "Cool & Dry (≤ 25°C, RH ≤ 65%)", shelfLifeMonths: 48, reorderLevel: "40 kg", reorderQty: "150 kg", hsCode: "2905.43.00", casNumber: "534-73-6", supplierId: "SUP-007", status: "Active" },
  // Packaging Materials
  { code: "PM-4501", name: "Alu-Alu Foil (Cold-Form) 250 Micron", type: "Packaging", category: "PM – Primary Packaging (Blister Foil)", uom: "rolls", pharmacopoeialStd: "IS 2798", storageCondition: "Cool & Dry (≤ 25°C, Away from moisture)", shelfLifeMonths: 24, reorderLevel: "50 rolls", reorderQty: "200 rolls", hsCode: "7607.11.90", casNumber: "—", supplierId: "SUP-001", status: "Active" },
  { code: "PM-5001", name: "ALU-ALU Foil 20×10 cm (Pre-cut)", type: "Packaging", category: "PM – Primary Packaging (Blister Foil)", uom: "pcs", pharmacopoeialStd: "IS 2798", storageCondition: "Cool & Dry, Protect from moisture", shelfLifeMonths: 24, reorderLevel: "5000 pcs", reorderQty: "20000 pcs", hsCode: "7607.11.90", casNumber: "—", supplierId: "SUP-001", status: "Active" },
  { code: "PM-5002", name: "Outer Carton — MEDISUM NIMUPARA", type: "Packaging", category: "PM – Secondary Packaging (Carton)", uom: "pcs", pharmacopoeialStd: "IS 1360", storageCondition: "Cool & Dry (≤ 30°C, RH ≤ 75%)", shelfLifeMonths: 24, reorderLevel: "2000 pcs", reorderQty: "10000 pcs", hsCode: "4819.20.00", casNumber: "—", supplierId: "SUP-008", status: "Active" },
  { code: "PM-6001", name: "Capsule Shell Size 1 — Clear HPMC", type: "Packaging", category: "PM – Primary Packaging (Capsule Shell)", uom: "pcs", pharmacopoeialStd: "IP 2022", storageCondition: "Cool & Dry (15–25°C, RH ≤ 65%)", shelfLifeMonths: 18, reorderLevel: "50000 pcs", reorderQty: "200000 pcs", hsCode: "9602.00.20", casNumber: "—", supplierId: "SUP-009", status: "Active" },
  { code: "PM-6002", name: "Blister Foil 200 MIC PVC/PVDC", type: "Packaging", category: "PM – Primary Packaging (Blister Foil)", uom: "pcs", pharmacopoeialStd: "IS 2798", storageCondition: "Cool & Dry, Protect from heat", shelfLifeMonths: 24, reorderLevel: "3000 pcs", reorderQty: "12000 pcs", hsCode: "3921.90.90", casNumber: "—", supplierId: "SUP-002", status: "Active" },
  { code: "PM-7001", name: "Package Insert / Leaflet — A4 Fold", type: "Packaging", category: "PM – Secondary Packaging (Leaflet)", uom: "pcs", pharmacopoeialStd: "CDSCO Guidelines", storageCondition: "Cool & Dry (≤ 30°C)", shelfLifeMonths: 24, reorderLevel: "5000 pcs", reorderQty: "20000 pcs", hsCode: "4911.99.90", casNumber: "—", supplierId: "SUP-008", status: "Active" },
  { code: "PM-7002", name: "HDPE Bottle 60ml with Cap & Wad", type: "Packaging", category: "PM – Primary Packaging (Bottle)", uom: "pcs", pharmacopoeialStd: "IS 10146", storageCondition: "Ambient (≤ 30°C)", shelfLifeMonths: 36, reorderLevel: "2000 pcs", reorderQty: "10000 pcs", hsCode: "3923.30.00", casNumber: "—", supplierId: "SUP-010", status: "Active" },
  { code: "PM-7003", name: "Tamper-Evident Label — Serialized", type: "Packaging", category: "PM – Secondary Packaging (Label)", uom: "pcs", pharmacopoeialStd: "CDSCO Track & Trace", storageCondition: "Cool & Dry, Protected from sunlight", shelfLifeMonths: 24, reorderLevel: "10000 pcs", reorderQty: "50000 pcs", hsCode: "4821.10.20", casNumber: "—", supplierId: "SUP-008", status: "Active" },
  // Finished Goods
  { code: "FG-001", name: "OFLACIN-OZ 200/500mg Tablets (10×10 Strip)", type: "Finished Good", category: "FG – Oral Solid Dosage (Tablet)", uom: "boxes", pharmacopoeialStd: "IP 2022", storageCondition: "Cool & Dry (≤ 25°C, Protect from light)", shelfLifeMonths: 24, reorderLevel: "500 boxes", reorderQty: "2000 boxes", hsCode: "3004.20.12", casNumber: "—", supplierId: "—", status: "Active", schedule: "H" },
  { code: "FG-002", name: "MEDISUM'S NIMUPARA Tabs 100/500mg (15×10 Strip)", type: "Finished Good", category: "FG – Oral Solid Dosage (Tablet)", uom: "boxes", pharmacopoeialStd: "IP 2022", storageCondition: "Cool & Dry (≤ 30°C)", shelfLifeMonths: 24, reorderLevel: "500 boxes", reorderQty: "2000 boxes", hsCode: "3004.90.90", casNumber: "—", supplierId: "—", status: "Active" },
  { code: "FG-003", name: "PANTOBIS-DSR 40/30mg Capsules (10×10 Strip)", type: "Finished Good", category: "FG – Oral Solid Dosage (Capsule)", uom: "boxes", pharmacopoeialStd: "IP 2022", storageCondition: "Cool & Dry, Protect from light", shelfLifeMonths: 24, reorderLevel: "300 boxes", reorderQty: "1200 boxes", hsCode: "3004.90.90", casNumber: "—", supplierId: "—", status: "Active", schedule: "H" },
  { code: "FG-004", name: "CEFIXIME-200 DT Tablets (10×10 Strip)", type: "Finished Good", category: "FG – Oral Solid Dosage (Dispersible Tablet)", uom: "boxes", pharmacopoeialStd: "IP 2022", storageCondition: "Cool & Dry (≤ 25°C, RH ≤ 60%)", shelfLifeMonths: 24, reorderLevel: "300 boxes", reorderQty: "1000 boxes", hsCode: "3004.20.90", casNumber: "—", supplierId: "—", status: "Active", schedule: "H" },
  { code: "FG-005", name: "LEVOBACT-500 Tablets (10×10 Strip)", type: "Finished Good", category: "FG – Oral Solid Dosage (Tablet)", uom: "boxes", pharmacopoeialStd: "IP 2022", storageCondition: "Cool & Dry, Protect from light", shelfLifeMonths: 24, reorderLevel: "400 boxes", reorderQty: "1500 boxes", hsCode: "3004.20.12", casNumber: "—", supplierId: "—", status: "Active", schedule: "H" },
  { code: "FG-006", name: "METFORMIN-SR-500 Tablets (10×10 Strip)", type: "Finished Good", category: "FG – Oral Solid Dosage (SR Tablet)", uom: "boxes", pharmacopoeialStd: "IP 2022 / USP", storageCondition: "Cool & Dry (≤ 25°C)", shelfLifeMonths: 36, reorderLevel: "500 boxes", reorderQty: "2000 boxes", hsCode: "3004.90.90", casNumber: "—", supplierId: "—", status: "Active" },
  { code: "FG-007", name: "AMOXYCLAV-625 Tablets (6×1 Strip)", type: "Finished Good", category: "FG – Oral Solid Dosage (Tablet)", uom: "boxes", pharmacopoeialStd: "IP 2022 / BP 2023", storageCondition: "Cool & Dry (≤ 25°C, RH ≤ 60%)", shelfLifeMonths: 24, reorderLevel: "300 boxes", reorderQty: "1200 boxes", hsCode: "3004.10.91", casNumber: "—", supplierId: "—", status: "Active", schedule: "H" },
  { code: "FG-008", name: "ATORVASTATIN-10 Tablets (10×10 Strip)", type: "Finished Good", category: "FG – Oral Solid Dosage (Tablet)", uom: "boxes", pharmacopoeialStd: "IP 2022", storageCondition: "Cool & Dry, Protect from light and moisture", shelfLifeMonths: 36, reorderLevel: "400 boxes", reorderQty: "1500 boxes", hsCode: "3004.90.90", casNumber: "—", supplierId: "—", status: "Active", schedule: "H" },
  { code: "FG-009", name: "RABEZOLE-20-DSR Capsules (10×10 Strip)", type: "Finished Good", category: "FG – Oral Solid Dosage (Capsule)", uom: "boxes", pharmacopoeialStd: "IP 2022", storageCondition: "Cool & Dry, Protect from light", shelfLifeMonths: 24, reorderLevel: "300 boxes", reorderQty: "1200 boxes", hsCode: "3004.90.90", casNumber: "—", supplierId: "—", status: "Active", schedule: "H" },
  { code: "FG-010", name: "DOLO-650 Tablets (15×10 Strip)", type: "Finished Good", category: "FG – Oral Solid Dosage (Tablet)", uom: "boxes", pharmacopoeialStd: "IP 2022", storageCondition: "Cool & Dry (≤ 30°C)", shelfLifeMonths: 36, reorderLevel: "1000 boxes", reorderQty: "5000 boxes", hsCode: "3004.90.90", casNumber: "—", supplierId: "—", status: "Active" },
];

const TYPE_COLORS: Record<string, { bg: string; text: string; icon: typeof Package }> = {
  "Raw Material": { bg: "bg-blue-50", text: "text-blue-700", icon: FlaskConical },
  "Packaging":    { bg: "bg-amber-50", text: "text-amber-700", icon: Layers },
  "Finished Good": { bg: "bg-green-50", text: "text-green-700", icon: Package },
};

const CATEGORY_GROUPS = ["All", "API – Fluoroquinolone", "API – Nitroimidazole", "API – NSAID", "API – Analgesic/Antipyretic", "API – PPI (Proton Pump Inhibitor)", "API – Cephalosporin Antibiotic", "API – Penicillin Antibiotic", "API – Statin (HMG-CoA Reductase Inhibitor)", "Excipient – Diluent/Binder", "Excipient – Disintegrant", "Excipient – Lubricant", "Excipient – Glidant", "PM – Primary Packaging (Blister Foil)", "PM – Secondary Packaging (Carton)", "FG – Oral Solid Dosage (Tablet)", "FG – Oral Solid Dosage (Capsule)"];

export default function MasterMaterial() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = SEED_MATERIALS.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      m.code.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.casNumber.toLowerCase().includes(q);
    const matchType = typeFilter === "all" || m.type === typeFilter;
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const stats = {
    total: SEED_MATERIALS.length,
    rm: SEED_MATERIALS.filter(m => m.type === "Raw Material").length,
    pm: SEED_MATERIALS.filter(m => m.type === "Packaging").length,
    fg: SEED_MATERIALS.filter(m => m.type === "Finished Good").length,
    coldStore: SEED_MATERIALS.filter(m => m.temperature).length,
    scheduled: SEED_MATERIALS.filter(m => m.schedule).length,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Material Master</h1>
              <p className="text-sm text-gray-500 mt-0.5">Centralised material registry — APIs, excipients, packaging and finished goods — SOP: MAT-001</p>
            </div>
            <Button onClick={() => toast({ title: "Coming soon", description: "Material creation wizard in next release." })}>
              <Plus className="w-4 h-4 mr-2" /> New Material
            </Button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { label: "Total Materials", value: stats.total, color: "text-gray-800", bg: "bg-white border-gray-200", icon: Package },
              { label: "Raw Materials / APIs", value: stats.rm, color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: FlaskConical },
              { label: "Packaging Materials", value: stats.pm, color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Layers },
              { label: "Finished Goods", value: stats.fg, color: "text-green-700", bg: "bg-green-50 border-green-200", icon: ShieldCheck },
              { label: "Cold Store Required", value: stats.coldStore, color: "text-cyan-700", bg: "bg-cyan-50 border-cyan-200", icon: Thermometer },
              { label: "Scheduled (H)", value: stats.scheduled, color: "text-red-700", bg: "bg-red-50 border-red-200", icon: BookOpen },
            ].map(s => (
              <Card key={s.label} className={`border ${s.bg}`}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <div>
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-500 leading-tight">{s.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search code, name, category, CAS number..." className="pl-8 h-9 text-xs" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 text-xs w-44"><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Material Types</SelectItem>
                <SelectItem value="Raw Material" className="text-xs">Raw Material / API</SelectItem>
                <SelectItem value="Packaging" className="text-xs">Packaging Material</SelectItem>
                <SelectItem value="Finished Good" className="text-xs">Finished Good</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs w-32"><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                <SelectItem value="Active" className="text-xs">Active</SelectItem>
                <SelectItem value="Inactive" className="text-xs">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {(search || typeFilter !== "all" || statusFilter !== "all") && (
              <Button size="sm" variant="ghost" className="h-9 text-xs text-gray-400" onClick={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); }}>
                Clear
              </Button>
            )}
            <span className="ml-auto text-xs text-gray-400 self-center">{filtered.length} of {SEED_MATERIALS.length} materials</span>
          </div>

          {/* Table */}
          <Card className="border border-gray-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-semibold">Material Code</TableHead>
                    <TableHead className="text-xs font-semibold">Name</TableHead>
                    <TableHead className="text-xs font-semibold">Type</TableHead>
                    <TableHead className="text-xs font-semibold">Category</TableHead>
                    <TableHead className="text-xs font-semibold">UOM</TableHead>
                    <TableHead className="text-xs font-semibold">Pharmacopoeial Std.</TableHead>
                    <TableHead className="text-xs font-semibold">Storage Condition</TableHead>
                    <TableHead className="text-xs font-semibold">Shelf Life</TableHead>
                    <TableHead className="text-xs font-semibold">Reorder Level</TableHead>
                    <TableHead className="text-xs font-semibold">HS Code</TableHead>
                    <TableHead className="text-xs font-semibold">CAS No.</TableHead>
                    <TableHead className="text-xs font-semibold">Schedule</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(m => {
                    const typeMeta = TYPE_COLORS[m.type] ?? TYPE_COLORS["Raw Material"];
                    const TypeIcon = typeMeta.icon;
                    return (
                      <TableRow key={m.code} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-xs font-bold text-indigo-700 whitespace-nowrap">{m.code}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-xs font-semibold text-gray-900 max-w-[200px]">{m.name}</p>
                            {m.temperature && (
                              <span className="flex items-center gap-1 text-xs text-cyan-600 mt-0.5">
                                <Thermometer className="h-3 w-3" />{m.temperature}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1.5 ${typeMeta.bg} ${typeMeta.text} rounded-md px-2 py-0.5 w-fit`}>
                            <TypeIcon className="h-3 w-3" />
                            <span className="text-xs font-medium">{m.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 max-w-[160px]">{m.category}</TableCell>
                        <TableCell className="text-xs text-gray-700 font-medium">{m.uom}</TableCell>
                        <TableCell className="text-xs text-gray-600">{m.pharmacopoeialStd}</TableCell>
                        <TableCell className="text-xs text-gray-600 max-w-[160px]">{m.storageCondition}</TableCell>
                        <TableCell className="text-xs text-gray-700">{m.shelfLifeMonths} months</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-xs text-gray-700">{m.reorderLevel}</p>
                            <p className="text-xs text-gray-400">ROQ: {m.reorderQty}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-500">{m.hsCode}</TableCell>
                        <TableCell className="font-mono text-xs text-gray-500">{m.casNumber}</TableCell>
                        <TableCell>
                          {m.schedule ? (
                            <Badge className="bg-red-50 text-red-700 border-0 text-xs">Sch. {m.schedule}</Badge>
                          ) : <span className="text-xs text-gray-300">—</span>}
                        </TableCell>
                        <TableCell>
                          <Badge className={`border-0 text-xs ${m.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                            {m.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
