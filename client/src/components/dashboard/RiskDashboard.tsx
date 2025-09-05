import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, TrendingDown, TrendingUp } from "lucide-react";

interface RiskDashboardProps {
  userId: string;
}

export default function RiskDashboard({ userId }: RiskDashboardProps) {
  const { data: riskMetrics } = useQuery({
    queryKey: ["/api/risk", userId],
  });

  const { data: positions = [] } = useQuery({
    queryKey: ["/api/positions", userId],
  });

  const riskScore = riskMetrics?.riskScore || 78;
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: "High", color: "text-red-400" };
    if (score >= 60) return { level: "Medium", color: "text-orange-400" };
    return { level: "Low", color: "text-green-400" };
  };

  const risk = getRiskLevel(riskScore);

  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Risk Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Portfolio Risk Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Portfolio Risk</span>
            <span className={`text-sm font-mono ${risk.color}`}>{risk.level}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
            <div 
              className="bg-gradient-to-r from-green-500 via-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${riskScore}%` }}
            ></div>
          </div>
          <span className="text-xs text-slate-400">{riskScore}% Risk Utilization</span>
        </div>

        {/* VaR Information */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-white mb-3">Value at Risk (VaR)</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">1-Day VaR</span>
                <span className="text-xs font-mono text-white">
                  ${riskMetrics ? Number(riskMetrics.varOneDay).toLocaleString() : '2,300,000'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">1-Week VaR</span>
                <span className="text-xs font-mono text-white">
                  ${riskMetrics ? Number(riskMetrics.varOneWeek).toLocaleString() : '8,700,000'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Max Drawdown</span>
                <span className="text-xs font-mono text-red-400">
                  ${riskMetrics ? Number(riskMetrics.maxDrawdown).toLocaleString() : '5,100,000'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Positions */}
        <div>
          <h4 className="text-sm font-medium text-white mb-3">Active Positions</h4>
          <div className="space-y-2">
            {positions.length === 0 ? (
              <div className="text-center py-4">
                <Shield className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No active positions</p>
              </div>
            ) : (
              positions.slice(0, 3).map((position: any) => {
                const pnl = parseFloat(position.unrealizedPnl);
                const isProfitable = pnl >= 0;
                
                return (
                  <div key={position.id} className="flex items-center justify-between py-2 px-3 bg-slate-800/30 rounded">
                    <div>
                      <span className="text-xs font-medium text-white">{position.symbol}</span>
                      <div className="text-xs text-slate-400">
                        {position.type} {Number(position.quantity).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {isProfitable ? (
                        <TrendingUp className="w-3 h-3 text-green-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-400" />
                      )}
                      <span className={`text-xs font-mono ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                        {isProfitable ? '+' : ''}${Math.abs(pnl).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-slate-700 space-y-2">
          <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
            Auto-Rebalance Portfolio
          </Button>
          <Button variant="outline" className="w-full border-slate-600 hover:border-slate-500" size="sm">
            Run Stress Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
