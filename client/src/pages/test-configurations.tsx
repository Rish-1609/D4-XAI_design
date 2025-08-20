import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, FlaskConical, Beaker, TestTube } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { TestConfig, InsertTestConfig } from "@shared/schema";

export default function TestConfigurations() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTestConfig, setNewTestConfig] = useState<InsertTestConfig>({
    name: "",
    category: "",
    testMethod: "",
    expectedRange: "",
    units: "",
    isMandatory: true,
    acceptanceCriteria: "",
  });

  const { data: testConfigs, isLoading } = useQuery({
    queryKey: ["/api/test-configs"],
    queryFn: async (): Promise<TestConfig[]> => {
      const response = await apiRequest("GET", "/api/test-configs");
      return response.json();
    },
  });

  const createTestConfigMutation = useMutation({
    mutationFn: async (data: InsertTestConfig): Promise<TestConfig> => {
      const response = await apiRequest("POST", "/api/test-configs", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/test-configs"] });
      setIsAddDialogOpen(false);
      setNewTestConfig({
        name: "",
        category: "",
        testMethod: "",
        expectedRange: "",
        units: "",
        isMandatory: true,
        acceptanceCriteria: "",
      });
      toast({
        title: "Success",
        description: "Test configuration created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create test configuration",
        variant: "destructive",
      });
    },
  });

  const pharmaTestMethods = [
    "HPLC",
    "UV-Vis Spectroscopy",
    "GC (Gas Chromatography)",
    "Titration",
    "Dissolution Testing",
    "pH meter",
    "Karl Fischer",
    "IR Spectroscopy",
    "Mass Spectrometry",
    "USP Type II Paddle",
    "USP <61> Microbial",
    "Custom Method",
  ];

  const testCategories = [
    "Chemical",
    "Physical", 
    "Microbiological",
    "Biological",
    "Stability",
    "Content Uniformity",
    "Dissolution",
    "Impurities",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTestConfigMutation.mutate(newTestConfig);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Test Configurations</h1>
              <p className="text-gray-600 mt-1">Manage pharma test methods and acceptance criteria</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-test-config">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Test Configuration
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Test Configuration</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Test Name *</Label>
                      <Input
                        id="name"
                        value={newTestConfig.name}
                        onChange={(e) => setNewTestConfig({...newTestConfig, name: e.target.value})}
                        placeholder="e.g., Assay by HPLC"
                        required
                        data-testid="input-test-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={newTestConfig.category}
                        onValueChange={(value) => setNewTestConfig({...newTestConfig, category: value})}
                      >
                        <SelectTrigger data-testid="select-test-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {testCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="testMethod">Test Method</Label>
                      <Select
                        value={newTestConfig.testMethod || ""}
                        onValueChange={(value) => setNewTestConfig({...newTestConfig, testMethod: value})}
                      >
                        <SelectTrigger data-testid="select-test-method">
                          <SelectValue placeholder="Select test method" />
                        </SelectTrigger>
                        <SelectContent>
                          {pharmaTestMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="units">Units</Label>
                      <Input
                        id="units"
                        value={newTestConfig.units || ""}
                        onChange={(e) => setNewTestConfig({...newTestConfig, units: e.target.value})}
                        placeholder="e.g., %, pH, mg/ml"
                        data-testid="input-test-units"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expectedRange">Expected Range</Label>
                      <Input
                        id="expectedRange"
                        value={newTestConfig.expectedRange || ""}
                        onChange={(e) => setNewTestConfig({...newTestConfig, expectedRange: e.target.value})}
                        placeholder="e.g., 95.0 - 105.0%, 6.8 - 7.2"
                        data-testid="input-test-range"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isMandatory"
                        checked={newTestConfig.isMandatory ?? true}
                        onCheckedChange={(checked) => setNewTestConfig({...newTestConfig, isMandatory: checked})}
                        data-testid="switch-test-mandatory"
                      />
                      <Label htmlFor="isMandatory">Mandatory Test</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acceptanceCriteria">Acceptance Criteria</Label>
                    <Textarea
                      id="acceptanceCriteria"
                      value={newTestConfig.acceptanceCriteria || ""}
                      onChange={(e) => setNewTestConfig({...newTestConfig, acceptanceCriteria: e.target.value})}
                      placeholder="Detailed acceptance criteria for this test..."
                      rows={3}
                      data-testid="textarea-test-criteria"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createTestConfigMutation.isPending} data-testid="button-save-test-config">
                      {createTestConfigMutation.isPending ? "Creating..." : "Create Test Configuration"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : testConfigs && testConfigs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testConfigs.map((config) => (
                <Card key={config.id} className="hover:shadow-md transition-shadow" data-testid={`card-test-config-${config.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {config.category === "Chemical" && <FlaskConical className="w-5 h-5 text-blue-600" />}
                        {config.category === "Physical" && <Beaker className="w-5 h-5 text-green-600" />}
                        {config.category === "Microbiological" && <TestTube className="w-5 h-5 text-purple-600" />}
                        <CardTitle className="text-lg" data-testid={`text-test-config-name-${config.id}`}>
                          {config.name}
                        </CardTitle>
                      </div>
                      {config.isMandatory && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Mandatory
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="w-fit">
                      {config.category}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {config.testMethod && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Test Method</p>
                        <p className="text-sm text-gray-600" data-testid={`text-test-method-${config.id}`}>
                          {config.testMethod}
                        </p>
                      </div>
                    )}
                    {config.expectedRange && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Expected Range</p>
                        <p className="text-sm text-gray-600" data-testid={`text-test-range-${config.id}`}>
                          {config.expectedRange} {config.units && `(${config.units})`}
                        </p>
                      </div>
                    )}
                    {config.acceptanceCriteria && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Acceptance Criteria</p>
                        <p className="text-sm text-gray-600" data-testid={`text-test-criteria-${config.id}`}>
                          {config.acceptanceCriteria}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TestTube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Test Configurations</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first test configuration.</p>
              <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-test-config">
                <Plus className="w-4 h-4 mr-2" />
                Add Test Configuration
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}