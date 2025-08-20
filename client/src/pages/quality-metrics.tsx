import { Sidebar } from "@/components/sidebar";
import { QualityAnalyticsDashboard } from "@/components/quality-analytics-dashboard";

export default function QualityMetrics() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Quality Metrics & Analytics</h2>
              <p className="text-gray-600 text-sm mt-1">Real-time quality control analytics and performance metrics</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <QualityAnalyticsDashboard />
          </div>
        </main>
      </div>
    </div>
  );
}