import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, TrendingDown, TrendingUp, BarChart3, Calculator, RefreshCw } from "lucide-react";

const DEMO_USER_ID = "trader";

const riskMetrics = [
  { name: "Portfolio VaR (1-Day)", value: "$2.3M", threshold: "$5M", status: "low", color: "text-green-400" },
  { name: "Portfolio VaR (1-Week)", value: "$8.7M", threshold: "$15M", status: "medium", color: "text-yellow-400" },
  { name: "Maximum Drawdown", value: "$5.1M", threshold: "$10M", status: "low", color: "text-green-400" },
  { name: "Leverage Ratio", value: "2.4x", threshold: "4.0x", status: "low", color: "text-green-400" },
  { name: "Concentration Risk", value: "68%", threshold: "80%", status: "medium", color: "text-yellow-400" },
  { name: "Liquidity Risk", value: "12%", threshold: "25%", status: "low", color: "text-green-400" }
];

const stressTests = [
  { scenario: "Oil Price -30%", impact: "-$4.2M", probability: "15%", timeframe: "3M" },
  { scenario: "Natural Gas +50%", impact: "+$2.8M", probability: "25%", timeframe: "1M" },
  { scenario: "Carbon Credit Crash", impact: "-$1.5M", probability: "10%", timeframe: "6M" },
  { scenario: "Geopolitical Crisis", impact: "-$6.1M", probability: "8%", timeframe: "1W" }
];

export default function RiskAnalysis() {
  const { data: riskData } = useQuery({
    queryKey: ["/api/risk", DEMO_USER_ID],
  });

  const { data: positions = [] } = useQuery({
    queryKey: ["/api/positions", DEMO_USER_ID],
  });

  const riskScore = riskData?.riskScore || 78;
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: "High", color: "text-red-400", bgColor: "bg-red-500" };
    if (score >= 60) return { level: "Medium", color: "text-orange-400", bgColor: "bg-orange-500" };
    return { level: "Low", color: "text-green-400", bgColor: "bg-green-500" };
  };

  const risk = getRiskLevel(riskScore);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Risk Analysis Center</h1>
          <p className="text-slate-400">Comprehensive portfolio risk assessment and stress testing</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="border-slate-600">
            <Calculator className="w-4 h-4 mr-2" />
            Run Stress Test
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Analysis
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="overview">Risk Overview</TabsTrigger>
          <TabsTrigger value="var">Value at Risk</TabsTrigger>
          <TabsTrigger value="stress">Stress Testing</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Risk Score Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="trading-card lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Shield className="w-6 h-6" />
                  <span>Portfolio Risk Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${risk.color} mb-2`}>{riskScore}</div>
                  <div className={`text-lg font-medium ${risk.color}`}>{risk.level} Risk</div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${risk.bgColor}`}
                    style={{ width: `${riskScore}%` }}
                  ></div>
                </div>
                <div className="text-sm text-slate-400 text-center">
                  Risk utilization: {riskScore}% of maximum tolerance
                </div>
              </CardContent>
            </Card>

            {/* Risk Metrics Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {riskMetrics.map((metric, index) => (
                <Card key={index} className="trading-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-slate-300">{metric.name}</div>
                      <Badge 
                        variant={metric.status === "low" ? "secondary" : "destructive"} 
                        className={`text-xs ${metric.color}`}
                      >
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                    <div className="text-xs text-slate-400">Threshold: {metric.threshold}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Position Risk Breakdown */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <BarChart3 className="w-6 h-6" />
                <span>Position Risk Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {positions.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No active positions to analyze</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {positions.map((position: any) => {
                    const pnl = parseFloat(position.unrealizedPnl);
                    const isProfitable = pnl >= 0;
                    const positionValue = parseFloat(position.quantity) * parseFloat(position.currentPrice);
                    const riskContribution = Math.abs(pnl) / 100000; // Simplified risk calc
                    
                    return (
                      <div key={position.id} className="bg-slate-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-lg font-medium text-white">{position.symbol}</div>
                            <div className="text-sm text-slate-400">
                              {position.type.toUpperCase()} {Number(position.quantity).toLocaleString()} @ ${position.entryPrice}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                              {isProfitable ? '+' : ''}${Math.abs(pnl).toLocaleString()}
                            </div>
                            <div className="text-sm text-slate-400">
                              Value: ${positionValue.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Risk Contribution</span>
                            <span className="text-white">{riskContribution.toFixed(1)}%</span>
                          </div>
                          <Progress value={riskContribution} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="var" className="space-y-6">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Value at Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-2">1-Day VaR (95% Confidence)</div>
                    <div className="text-3xl font-bold text-red-400">$2.3M</div>
                    <div className="text-sm text-slate-500">Maximum expected loss in 1 day</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-slate-400 mb-2">1-Week VaR (95% Confidence)</div>
                    <div className="text-3xl font-bold text-red-400">$8.7M</div>
                    <div className="text-sm text-slate-500">Maximum expected loss in 1 week</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-2">Expected Shortfall (ES)</div>
                    <div className="text-2xl font-bold text-orange-400">$3.8M</div>
                    <div className="text-sm text-slate-500">Average loss beyond VaR</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-slate-400 mb-2">Incremental VaR</div>
                    <div className="text-2xl font-bold text-blue-400">$1.2M</div>
                    <div className="text-sm text-slate-500">Additional risk from new positions</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-2">Component VaR</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-white">Natural Gas</span>
                        <span className="text-sm text-red-400">$1.4M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-white">Crude Oil</span>
                        <span className="text-sm text-red-400">$0.7M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-white">Power</span>
                        <span className="text-sm text-red-400">$0.2M</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stress" className="space-y-6">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6" />
                <span>Stress Test Scenarios</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stressTests.map((test, index) => {
                  const isPositive = test.impact.startsWith('+');
                  const impactColor = isPositive ? 'text-green-400' : 'text-red-400';
                  const ImpactIcon = isPositive ? TrendingUp : TrendingDown;
                  
                  return (
                    <div key={index} className="bg-slate-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <ImpactIcon className={`w-5 h-5 ${impactColor}`} />
                            <div className="text-lg font-medium text-white">{test.scenario}</div>
                          </div>
                          <div className="flex items-center space-x-6 text-sm">
                            <div>
                              <span className="text-slate-400">Probability: </span>
                              <span className="text-white">{test.probability}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Timeframe: </span>
                              <span className="text-white">{test.timeframe}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${impactColor}`}>{test.impact}</div>
                          <div className="text-sm text-slate-400">Portfolio Impact</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Custom Scenario Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calculator className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">Custom scenario analysis</p>
                <p className="text-sm text-slate-500">Build custom scenarios with multiple market variables</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                  Launch Scenario Builder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}