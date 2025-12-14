import { useState } from "react";
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
  Factory
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
    id: "inventory-management",
    label: "Inventory Management",
    icon: Warehouse,
    submenu: [
      { label: "Stock Overview", href: "/inventory-overview" },
      { label: "Stock Movements", href: "/stock-movements" },
    ],
  },
  {
    id: "quality-assurance",
    label: "Quality Assurance",
    icon: Shield,
    submenu: [
      { label: "Assignment Tracker", href: "/qa-assignment-tracker" },
      { label: "QC & Batch Release", href: "/qa-batch-release" },
      { label: "CAPA Management", href: "/qa-capa" },
      { label: "Risk Management", href: "/qa-risk-management" },
    ],
  },
  {
    id: "qc-management",
    label: "QC Management",
    icon: CheckCircle,
    submenu: [
      { label: "Material QC", href: "/" },
      { label: "QC Setup & Instructions", href: "/qc-setup" },
    ],
  },
  { id: "sop-management", label: "SOP Management", icon: FileText, href: "/sop-management" },
  { id: "bom-management", label: "BOM Management", icon: Layers, href: "/bom-management" },
  {
    id: "testing-management",
    label: "Testing & Release",
    icon: CheckCircle,
    submenu: [
      { label: "Stability Testing", href: "/stability-testing" },
      { label: "Terminal Testing", href: "/terminal-testing" },
    ],
  },
  { id: "audit-trail", label: "Audit Trail", icon: FileCheck, href: "/qa-audit-trail" },
  { id: "quality-metrics", label: "Quality Metrics", icon: TrendingUp, href: "/quality-metrics" },
];

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Auto-expand menu if current location matches a submenu item
  const getDefaultExpandedMenus = () => {
    const expanded: string[] = [];
    menuItems.forEach(item => {
      if (item.submenu) {
        const hasActiveSubmenu = item.submenu.some(subItem => subItem.href === location);
        if (hasActiveSubmenu) {
          expanded.push(item.id);
        }
      }
    });
    return expanded;
  };

  // Set expanded menus based on current location on mount
  const defaultExpanded = getDefaultExpandedMenus();
  if (defaultExpanded.length > 0 && expandedMenus.length === 0) {
    setExpandedMenus(defaultExpanded);
  }

  const toggleSubmenu = (menuId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
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
                        <Link key={subItem.href} href={subItem.href}>
                          <button className="block w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors">
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
