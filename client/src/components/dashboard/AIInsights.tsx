import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";

interface AIInsightsProps {
  userId: string;
}

export default function AIInsights({ userId }: AIInsightsProps) {
  const { data: insights = [], isLoading } = useQuery({
    queryKey: ["/api/insights", userId],
  });

  if (isLoading) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Brain className="w-6 h-6" />
            <span>AI Market Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-800/50 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-full mb-1"></div>
                <div className="h-3 bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getIcon = (category: string) => {
    switch (category) {
      case "alert": return AlertTriangle;
      case "opportunity": return TrendingUp;
      case "risk": return AlertTriangle;
      default: return Lightbulb;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "alert": return "border-orange-500 text-orange-400";
      case "opportunity": return "border-green-500 text-green-400";
      case "risk": return "border-red-500 text-red-400";
      default: return "border-blue-500 text-blue-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-orange-500/20 text-orange-400";
      case "medium": return "bg-blue-500/20 text-blue-400";
      case "low": return "bg-green-500/20 text-green-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <Card className="trading-card">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
            <Brain className="text-white w-4 h-4" />
          </div>
          <CardTitle className="text-lg font-semibold text-white">AI Market Insights</CardTitle>
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <div className="w-1 h-1 bg-green-400 rounded-full pulse-dot"></div>
            <span>Updated {insights.length > 0 ? '2 mins ago' : 'pending'}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">AI agents are analyzing market conditions...</p>
            <p className="text-sm text-slate-500 mt-2">Fresh insights will appear here shortly</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.slice(0, 3).map((insight: any) => {
              const Icon = getIcon(insight.category);
              const categoryColor = getCategoryColor(insight.category);
              const priorityColor = getPriorityColor(insight.priority);
              
              return (
                <div key={insight.id} className={`bg-slate-800/50 rounded-lg p-4 border-l-4 ${categoryColor}`}>
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-5 h-5 mt-1 ${categoryColor.split(' ')[1]}`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-2">{insight.title}</h4>
                      <p className="text-slate-300 text-sm">{insight.description}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`text-xs px-2 py-1 rounded ${priorityColor}`}>
                          {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)} Priority
                        </span>
                        <span className="text-xs text-slate-400">
                          Confidence: {Math.round(parseFloat(insight.confidence))}%
                        </span>
                        <span className="text-xs text-slate-500">
                          {insight.agentType?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
