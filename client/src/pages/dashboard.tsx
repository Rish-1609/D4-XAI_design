import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radio } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { StatusCards } from "@/components/status-cards";
import { MaterialTable } from "@/components/material-table";

const tabs = [
  { id: "raw-materials", label: "Raw Materials", title: "Raw Materials" },
  { id: "packaging-material", label: "Packaging Material", title: "Packaging Materials" },
  { id: "final-products", label: "Final Products", title: "Final Products" },
  { id: "artwork", label: "Artwork", title: "Artwork" },
  { id: "instructions-checklists", label: "Instructions & Checklists", title: "Instructions & Checklists" },
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
            <div className="flex items-center space-x-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-real-time-monitoring">
                <Radio className="w-4 h-4 mr-2" />
                Real-time Monitoring
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Status Cards */}
            <StatusCards />

            {/* Tabbed Material Management */}
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
                  <MaterialTable materialType={tab.id} title={tab.title} />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
