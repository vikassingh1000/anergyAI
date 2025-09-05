import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bot, Info, Clock } from "lucide-react";

interface ActivityTableProps {
  userId: string;
}

export default function ActivityTable({ userId }: ActivityTableProps) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["/api/activity", userId],
  });

  if (isLoading) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Recent Activity & Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-800 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "alert": return AlertTriangle;
      case "trade": return Bot;
      default: return Info;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "alert": return "bg-orange-500/20 text-orange-400";
      case "trade": return "bg-green-500/20 text-green-400";
      default: return "bg-blue-500/20 text-blue-400";
    }
  };

  const getImpactColor = (impact: string) => {
    if (impact?.includes('+')) return "text-green-400";
    if (impact?.includes('-')) return "text-red-400";
    return "text-slate-400";
  };

  return (
    <Card className="trading-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">Recent Activity & Alerts</CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No recent activity</p>
            <p className="text-sm text-slate-500 mt-2">Activity will appear here as it happens</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-medium text-slate-400 pb-3">Time</th>
                  <th className="text-left text-xs font-medium text-slate-400 pb-3">Type</th>
                  <th className="text-left text-xs font-medium text-slate-400 pb-3">Description</th>
                  <th className="text-left text-xs font-medium text-slate-400 pb-3">Impact</th>
                  <th className="text-left text-xs font-medium text-slate-400 pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {activities.slice(0, 5).map((activity: any) => {
                  const TypeIcon = getTypeIcon(activity.type);
                  const typeColor = getTypeColor(activity.type);
                  const impactColor = getImpactColor(activity.impact);
                  
                  return (
                    <tr key={activity.id} className="border-b border-slate-800/50">
                      <td className="py-3 text-xs text-slate-300 font-mono">
                        {new Date(activity.createdAt).toLocaleTimeString('en-US', {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${typeColor}`}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-slate-300 max-w-xs truncate">
                        {activity.description}
                      </td>
                      <td className={`py-3 text-xs font-mono ${impactColor}`}>
                        {activity.impact || 'Neutral'}
                      </td>
                      <td className="py-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs bg-slate-700 hover:bg-slate-600 h-6 px-2"
                        >
                          {activity.type === 'alert' ? 'Review' : 'Details'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
