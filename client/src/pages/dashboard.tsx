import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radio, BarChart3 } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { QualityAnalyticsDashboard } from "@/components/quality-analytics-dashboard";
import { MaterialTable } from "@/components/material-table";
import { QCRecordsTable } from "@/components/qc-records-table";

const tabs = [
  { id: "raw-materials", label: "Raw Materials", title: "Raw Materials" },
  { id: "packaging-material", label: "Packaging Material", title: "Packaging Materials" },
  { id: "in-process", label: "In Process", title: "In Process" },
  { id: "final-products", label: "Final Products", title: "Final Products" },
  { id: "artwork", label: "Artwork", title: "Artwork" },
  { id: "qc-records", label: "QC Records", title: "QC Records" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("raw-materials");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Materials and QC</h2>
              <p className="text-gray-600 text-sm mt-1">Manage materials with quality control protocols</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Tabbed Content with Quality Analytics */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-white border-b border-gray-200 h-auto p-0 rounded-none w-full justify-start">
                <div className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none bg-transparent"
                      data-testid={`tab-${tab.id}`}
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </div>
              </TabsList>

              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-6">
                  {tab.id === "qc-records" ? (
                    <QCRecordsTable />
                  ) : (
                    <MaterialTable materialType={tab.id} title={tab.title} />
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
