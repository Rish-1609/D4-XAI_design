import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  ChevronRight, 
  Box, 
  Gauge, 
  CheckCircle, 
  FileText, 
  Triangle, 
  TrendingUp, 
  Settings,
  User,
  LogOut,
  Package,
  Layers,
  Warehouse,
  ArrowRightLeft,
  Shield,
  Award,
  FileCheck,
  ClipboardList,
  AlertCircle,
  ShieldAlert,
  Factory,
  DollarSign,
  Calculator,
  Wallet,
  BookOpen,
  Radio,
  Building2,
  Users,
  Wrench,
  Database,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

const menuItems = [
  {
    id: "production-management",
    label: "Production Management",
    icon: Factory,
    submenu: [
      { label: "Production Overview", href: "/production-overview" },
      { label: "Production Workspace", href: "/production-workspace" },
      { label: "Job Scheduling", href: "/job-scheduling" },
      { label: "Release & Analytics", href: "/release-analytics" },
    ],
  },
  { id: "production-orders", label: "Production Orders", icon: Package, href: "/production-orders" },
  {
    id: "master-data",
    label: "Master",
    icon: Database,
    submenu: [
      { label: "Supplier Management",  href: "/master-suppliers" },
      { label: "Customer Management",  href: "/master-customers" },
      { label: "BOM Management",       href: "/bom-management" },
      { label: "Production Orders",    href: "/production-orders" },
      { label: "Equipment Management", href: "/master-equipment" },
      { label: "Material Master",      href: "/master-material" },
    ],
  },
  {
    id: "inventory-management",
    label: "Inventory Management",
    icon: Warehouse,
    submenu: [
      { label: "Stock Overview",        href: "/inventory-overview" },
      { label: "Transactions & Movements", href: "/inventory-transactions" },
      { label: "Handling Units",        href: "/inventory-master" },
      { label: "Barcode Registry",      href: "/inventory-barcodes" },
      { label: "RFID Monitoring",       href: "/inventory-rfid" },
      { label: "Exceptions",            href: "/inventory-exceptions" },
      { label: "Traceability Search",   href: "/inventory-traceability-search" },
    ],
  },
  {
    id: "quality-assurance",
    label: "Quality Assurance",
    icon: Shield,
    submenu: [
      { label: "Assignment Tracker", href: "/qa-assignment-tracker" },
      { label: "QC & Batch Release", href: "/qa-batch-release" },
      { label: "CAPA Management",    href: "/qa-capa" },
      { label: "Risk Management",    href: "/qa-risk-management" },
    ],
  },
  {
    id: "qc-management",
    label: "QC Management",
    icon: CheckCircle,
    submenu: [
      { label: "Material QC",            href: "/" },
      { label: "QC Setup & Instructions",href: "/qc-setup" },
    ],
  },
  { id: "sop-management", label: "SOP Management", icon: FileText, href: "/sop-management" },
  {
    id: "testing-management",
    label: "Testing & Release",
    icon: CheckCircle,
    submenu: [
      { label: "Stability Testing", href: "/stability-testing" },
      { label: "Terminal Testing",  href: "/terminal-testing" },
    ],
  },
  { id: "audit-trail",     label: "Audit Trail",     icon: FileCheck,  href: "/qa-audit-trail" },
  { id: "quality-metrics", label: "Quality Metrics",  icon: TrendingUp, href: "/quality-metrics" },
  {
    id: "finance-management",
    label: "Finance Management",
    icon: DollarSign,
    submenu: [
      { label: "Financial Setup",        href: "/finance-setup" },
      { label: "Transactions (AP/AR)",   href: "/finance-transactions" },
      { label: "Manufacturing Finance",  href: "/finance-manufacturing" },
      { label: "Ledger & Insights",      href: "/finance-ledger" },
    ],
  },
];

const STORAGE_KEY = "d4_sidebar_expanded";

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  // Compute which menus should be open based on current route
  const getMenusForLocation = (loc: string): string[] => {
    const expanded: string[] = [];
    menuItems.forEach(item => {
      if (item.submenu && item.submenu.some(sub => sub.href === loc)) {
        expanded.push(item.id);
      }
    });
    return expanded;
  };

  // Initialise from localStorage; if nothing stored, auto-expand active section
  const [expandedMenus, setExpandedMenus] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as string[];
    } catch {}
    return getMenusForLocation(location);
  });

  // When location changes, ensure the active section stays expanded
  useEffect(() => {
    const active = getMenusForLocation(location);
    if (active.length > 0) {
      setExpandedMenus(prev => {
        const next = Array.from(new Set([...prev, ...active]));
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
    }
  }, [location]);

  const toggleSubmenu = (menuId: string, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setExpandedMenus(prev => {
      const next = prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId];
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <div className={cn("w-64 bg-navy-900 text-white flex flex-col h-screen", className)}>
      {/* Logo Header */}
      <div className="p-4 border-b border-navy-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Box className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">D4 Workspace</h1>
            <p className="text-xs text-gray-400">Active</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {menuItems.map((item) => (
            <div key={item.id} className="relative">
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg text-gray-300 hover:bg-navy-800 transition-colors"
                    data-testid={`button-toggle-${item.id}`}
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </div>
                    <ChevronRight 
                      className={cn(
                        "w-3 h-3 transition-transform",
                        expandedMenus.includes(item.id) && "rotate-90"
                      )}
                    />
                  </button>
                  {expandedMenus.includes(item.id) && item.submenu.length > 0 && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link key={subItem.label + subItem.href} href={subItem.href}>
                          <button className={cn(
                            "block w-full text-left px-3 py-2 text-xs transition-colors rounded",
                            location === subItem.href
                              ? "text-white bg-blue-600/70 font-medium"
                              : "text-gray-400 hover:text-white hover:bg-white/10"
                          )}>
                            {subItem.label}
                          </button>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link href={item.href || "#"}>
                  <button
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
                      item.href === location 
                        ? "bg-blue-600 text-white" 
                        : "text-gray-300 hover:bg-navy-800"
                    )}
                    data-testid={`button-nav-${item.id}`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-navy-800">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-400">admin@d4workspace.com</p>
          </div>
          <button className="text-gray-400 hover:text-white" data-testid="button-user-settings">
            <Settings className="w-4 h-4" />
          </button>
        </div>
        <div className="flex space-x-2">
          <Button 
            className="flex-1 bg-blue-600 text-white px-3 py-2 text-xs font-medium hover:bg-blue-700"
            data-testid="button-profile"
          >
            <User className="w-3 h-3 mr-1" />
            Profile
          </Button>
          <Button 
            className="flex-1 bg-navy-800 text-gray-300 px-3 py-2 text-xs font-medium hover:bg-navy-700"
            data-testid="button-logout"
          >
            <LogOut className="w-3 h-3 mr-1" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
