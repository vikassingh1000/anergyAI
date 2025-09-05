import { useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import MarketOverview from "@/components/dashboard/MarketOverview";
import PriceChart from "@/components/dashboard/PriceChart";
import AIInsights from "@/components/dashboard/AIInsights";
import RiskDashboard from "@/components/dashboard/RiskDashboard";
import ActivityTable from "@/components/dashboard/ActivityTable";
import AIChatPanel from "@/components/chat/AIChatPanel";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useMarketData } from "@/hooks/useMarketData";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const DEMO_USER_ID = "trader"; // Using demo user for this implementation

export default function Dashboard() {
  const { toast } = useToast();
  const { isConnected, marketData } = useWebSocket(DEMO_USER_ID);
  const { refetch: refetchMarketData } = useMarketData();

  const handleRefresh = async () => {
    try {
      await apiRequest("POST", `/api/analyze/${DEMO_USER_ID}`);
      await refetchMarketData();
      toast({
        title: "Data Refreshed",
        description: "Market data and AI analysis updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Auto-trigger analysis on component mount
    const timer = setTimeout(() => {
      handleRefresh();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Dashboard */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="bg-slate-900 border-b border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Energy Market Dashboard</h2>
                <p className="text-slate-400">Real-time insights powered by agentic AI</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-slate-800 rounded-lg px-3 py-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 pulse-dot' : 'bg-red-500'}`}></div>
                  <span className="text-sm">{isConnected ? 'Live Data' : 'Disconnected'}</span>
                </div>
                <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6 space-y-6">
            {/* Market Overview Cards */}
            <MarketOverview userId={DEMO_USER_ID} />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PriceChart />
              <PriceChart isVolatility={true} />
            </div>

            {/* AI Insights & Risk Management */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AIInsights userId={DEMO_USER_ID} />
              </div>
              <RiskDashboard userId={DEMO_USER_ID} />
            </div>

            {/* Activity Table */}
            <ActivityTable userId={DEMO_USER_ID} />
          </div>
        </div>

        {/* AI Chat Panel */}
        <AIChatPanel userId={DEMO_USER_ID} />
      </div>
    </div>
  );
}
