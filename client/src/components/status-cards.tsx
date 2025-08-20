import { useQuery } from "@tanstack/react-query";
import { materialsApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

export function StatusCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/quality-stats"],
    queryFn: materialsApi.getQualityStats,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {/* Approved Materials */}
      <Card className="bg-green-50 border-green-200" data-testid="card-approved-materials">
        <CardContent className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-green-600" data-testid="text-approved-count">
                {stats?.approved || 0}
              </span>
            </div>
          </div>
          <p className="text-center text-sm font-medium text-green-800">
            Approved Materials
          </p>
        </CardContent>
      </Card>

      {/* Pending Review */}
      <Card className="bg-yellow-50 border-yellow-200" data-testid="card-pending-materials">
        <CardContent className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-yellow-600" data-testid="text-pending-count">
                {stats?.pending || 0}
              </span>
            </div>
          </div>
          <p className="text-center text-sm font-medium text-yellow-800">
            Pending Review
          </p>
        </CardContent>
      </Card>

      {/* Failed/Requires Action */}
      <Card className="bg-red-50 border-red-200" data-testid="card-failed-materials">
        <CardContent className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-red-600" data-testid="text-failed-count">
                {stats?.failed || 0}
              </span>
            </div>
          </div>
          <p className="text-center text-sm font-medium text-red-800">
            Failed/Requires Action
          </p>
        </CardContent>
      </Card>

      {/* Under Testing */}
      <Card className="bg-purple-50 border-purple-200" data-testid="card-under-testing-materials">
        <CardContent className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600" data-testid="text-under-testing-count">
                {stats?.underTesting || 0}
              </span>
            </div>
          </div>
          <p className="text-center text-sm font-medium text-purple-800">
            Under Testing
          </p>
        </CardContent>
      </Card>

      {/* Quality Score */}
      <Card className="bg-blue-50 border-blue-200" data-testid="card-quality-score">
        <CardContent className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600" data-testid="text-quality-score">
                {stats?.averageScore ? `${stats.averageScore}%` : "0%"}
              </span>
            </div>
          </div>
          <p className="text-center text-sm font-medium text-blue-800">
            Average Quality Score
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
