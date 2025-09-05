import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Droplets, Zap, Leaf, TrendingUp, TrendingDown, Database, RefreshCw, Filter } from "lucide-react";

const DEMO_USER_ID = "trader";

const commodityDetails = {
  "NATURAL_GAS": {
    name: "Natural Gas",
    icon: Flame,
    color: "text-orange-400",
    unit: "$/MMBtu",
    exchange: "NYMEX",
    contract: "NG",
    description: "Henry Hub Natural Gas futures for immediate delivery"
  },
  "CRUDE_OIL": {
    name: "Crude Oil", 
    icon: Droplets,
    color: "text-slate-400",
    unit: "$/bbl",
    exchange: "NYMEX", 
    contract: "CL",
    description: "WTI Crude Oil futures with monthly settlement"
  },
  "POWER_PRICE": {
    name: "Power Price",
    icon: Zap,
    color: "text-blue-400", 
    unit: "$/MWh",
    exchange: "ICE",
    contract: "PWR",
    description: "Electricity futures for major grid delivery points"
  },
  "CARBON_CREDITS": {
    name: "Carbon Credits",
    icon: Leaf,
    color: "text-green-400",
    unit: "$/tonne",
    exchange: "ICE",
    contract: "CCF", 
    description: "EU Allowances (EUA) carbon emission credits"
  }
};

export default function MarketData() {
  const { data: marketData = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/market-data"],
    refetchInterval: 30000,
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Market Data Center</h1>
          <p className="text-slate-400">Real-time energy commodity prices and market information</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="border-slate-600">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button onClick={handleRefresh} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          <TabsTrigger value="historical">Historical Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Market Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(commodityDetails).map(([symbol, details]) => {
              const data = marketData.find((d: any) => d.symbol === symbol);
              const Icon = details.icon;
              const changeColor = data?.change >= 0 ? "text-green-400" : "text-red-400";
              const TrendIcon = data?.change >= 0 ? TrendingUp : TrendingDown;
              
              return (
                <Card key={symbol} className="trading-card hover:border-slate-600 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-6 h-6 ${details.color}`} />
                        <div>
                          <CardTitle className="text-lg text-white">{details.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {details.exchange}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-400">{details.contract}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold text-white font-mono">
                        {data ? `${details.unit.split('/')[0]}${Number(data.price).toFixed(2)}` : '--'}
                      </div>
                      <div className="text-sm text-slate-400">{details.unit}</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendIcon className={`w-4 h-4 ${changeColor}`} />
                        <span className={`text-sm font-medium ${changeColor}`}>
                          {data ? `${data.change >= 0 ? '+' : ''}${Number(data.changePercent).toFixed(1)}%` : '--'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Last: {data ? new Date(data.timestamp).toLocaleTimeString() : '--'}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-700">
                      <div className="text-xs text-slate-400 mb-1">24h Volume</div>
                      <div className="text-sm font-medium text-white">
                        {data?.volume ? Number(data.volume).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Market Status */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Database className="w-6 h-6" />
                <span>Market Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-slate-400 mb-2">Data Sources</div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-white">NYMEX Feed</span>
                      <Badge variant="secondary" className="text-xs">Live</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-white">ICE Data</span>
                      <Badge variant="secondary" className="text-xs">Live</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm text-white">Weather API</span>
                      <Badge variant="outline" className="text-xs">Delayed</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-slate-400 mb-2">Update Frequency</div>
                  <div className="space-y-1">
                    <div className="text-sm text-white">Real-time: <span className="text-green-400">30 seconds</span></div>
                    <div className="text-sm text-white">Historical: <span className="text-blue-400">1 minute</span></div>
                    <div className="text-sm text-white">News: <span className="text-orange-400">5 minutes</span></div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-400 mb-2">Data Quality</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-white">Accuracy</span>
                      <span className="text-sm text-green-400">99.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white">Latency</span>
                      <span className="text-sm text-blue-400">&lt; 100ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white">Uptime</span>
                      <span className="text-sm text-green-400">99.9%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Detailed Market Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-xs font-medium text-slate-400 pb-3">Symbol</th>
                      <th className="text-left text-xs font-medium text-slate-400 pb-3">Price</th>
                      <th className="text-left text-xs font-medium text-slate-400 pb-3">Change</th>
                      <th className="text-left text-xs font-medium text-slate-400 pb-3">% Change</th>
                      <th className="text-left text-xs font-medium text-slate-400 pb-3">Volume</th>
                      <th className="text-left text-xs font-medium text-slate-400 pb-3">Last Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketData.map((item: any) => {
                      const details = commodityDetails[item.symbol];
                      const changeColor = item.change >= 0 ? "text-green-400" : "text-red-400";
                      
                      return (
                        <tr key={item.symbol} className="border-b border-slate-800/50">
                          <td className="py-3">
                            <div className="flex items-center space-x-3">
                              {details && (
                                <details.icon className={`w-4 h-4 ${details.color}`} />
                              )}
                              <div>
                                <div className="text-sm font-medium text-white">{details?.name || item.symbol}</div>
                                <div className="text-xs text-slate-400">{details?.exchange}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-sm font-mono text-white">
                            {details?.unit.split('/')[0]}{Number(item.price).toFixed(2)}
                          </td>
                          <td className={`py-3 text-sm font-mono ${changeColor}`}>
                            {item.change >= 0 ? '+' : ''}{Number(item.change).toFixed(2)}
                          </td>
                          <td className={`py-3 text-sm font-mono ${changeColor}`}>
                            {item.change >= 0 ? '+' : ''}{Number(item.changePercent).toFixed(1)}%
                          </td>
                          <td className="py-3 text-sm font-mono text-white">
                            {item.volume ? Number(item.volume).toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-3 text-xs text-slate-400">
                            {new Date(item.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical" className="space-y-6">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Historical Price Charts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Database className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">Historical data visualization</p>
                <p className="text-sm text-slate-500">Interactive charts with 1Y, 5Y, and custom date ranges</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                  Load Historical Charts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}