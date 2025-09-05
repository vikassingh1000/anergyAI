import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bot, Brain, Shield, Globe, ChartLine, Zap, Play, Pause, Settings } from "lucide-react";

const DEMO_USER_ID = "trader";

interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  status: "active" | "idle" | "error";
  lastRun: string;
  successRate: number;
  insights: number;
  icon: any;
  color: string;
}

const agents: Agent[] = [
  {
    id: "market_analyzer",
    name: "Market Analyzer",
    type: "Analysis",
    description: "Continuously monitors market volatility, price movements, and trading patterns across energy commodities",
    status: "active",
    lastRun: "2 mins ago",
    successRate: 94,
    insights: 127,
    icon: ChartLine,
    color: "bg-blue-500"
  },
  {
    id: "risk_manager",
    name: "Risk Manager", 
    type: "Risk Assessment",
    description: "Calculates Value at Risk (VaR), monitors portfolio concentration, and provides real-time risk alerts",
    status: "active",
    lastRun: "3 mins ago",
    successRate: 97,
    insights: 89,
    icon: Shield,
    color: "bg-green-500"
  },
  {
    id: "news_correlator",
    name: "News Correlator",
    type: "Information Synthesis",
    description: "Analyzes breaking news, geopolitical events, and regulatory changes to correlate market impacts",
    status: "idle",
    lastRun: "8 mins ago",
    successRate: 89,
    insights: 56,
    icon: Globe,
    color: "bg-orange-500"
  },
  {
    id: "trading_executor",
    name: "Trading Executor",
    type: "Automation",
    description: "Executes autonomous trades based on AI insights and predefined risk parameters",
    status: "active",
    lastRun: "1 min ago",
    successRate: 91,
    insights: 34,
    icon: Zap,
    color: "bg-purple-500"
  }
];

export default function AIAgents() {
  const { data: insights = [] } = useQuery({
    queryKey: ["/api/insights", DEMO_USER_ID],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "idle": return "bg-yellow-500";
      case "error": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Running";
      case "idle": return "Standby";
      case "error": return "Error";
      default: return "Unknown";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">AI Agent Management</h1>
        <p className="text-slate-400">Monitor and control your autonomous trading agents</p>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const statusColor = getStatusColor(agent.status);
          const statusText = getStatusText(agent.status);
          
          return (
            <Card key={agent.id} className="trading-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${agent.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">{agent.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {agent.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${statusColor} pulse-dot`}></div>
                    <span className="text-sm text-slate-300">{statusText}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-300">{agent.description}</p>
                
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-400">Success Rate</div>
                    <div className="text-lg font-bold text-white">{agent.successRate}%</div>
                    <Progress value={agent.successRate} className="mt-1 h-2" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Insights</div>
                    <div className="text-lg font-bold text-white">{agent.insights}</div>
                    <div className="text-xs text-green-400">+{Math.floor(Math.random() * 20)} today</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Last Run</div>
                    <div className="text-sm text-slate-300">{agent.lastRun}</div>
                    <div className="text-xs text-slate-400">Auto refresh: 30s</div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="border-slate-600">
                      {agent.status === "active" ? (
                        <>
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </>
                      )}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-slate-400">
                      <Settings className="w-4 h-4 mr-1" />
                      Config
                    </Button>
                  </div>
                  <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700">
                    View Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Agent Activity */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Brain className="w-6 h-6" />
            <span>Recent Agent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.slice(0, 5).map((insight: any) => (
              <div key={insight.id} className="flex items-center space-x-4 p-3 bg-slate-800/50 rounded-lg">
                <div className={`w-8 h-8 ${agents.find(a => a.id === insight.agentType)?.color || 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{insight.title}</div>
                  <div className="text-xs text-slate-400">
                    {insight.agentType?.replace('_', ' ')} • {insight.priority} priority • {Math.round(parseFloat(insight.confidence))}% confidence
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(insight.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}