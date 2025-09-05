import { useQuery } from "@tanstack/react-query";
import { Flame, Droplets, Zap, Leaf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MarketOverviewProps {
  userId: string;
}

export default function MarketOverview({ userId }: MarketOverviewProps) {
  const { data: marketData = [], isLoading } = useQuery({
    queryKey: ["/api/market-data"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="trading-card animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-slate-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const marketItems = [
    {
      symbol: "NATURAL_GAS",
      name: "Natural Gas",
      icon: Flame,
      color: "text-orange-400",
      unit: "$"
    },
    {
      symbol: "CRUDE_OIL",
      name: "Crude Oil",
      icon: Droplets,
      color: "text-slate-400",
      unit: "$"
    },
    {
      symbol: "POWER_PRICE",
      name: "Power Price",
      icon: Zap,
      color: "text-blue-400",
      unit: "$/MWh"
    },
    {
      symbol: "CARBON_CREDITS",
      name: "Carbon Credits",
      icon: Leaf,
      color: "text-green-400",
      unit: "$/tonne"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {marketItems.map((item) => {
        const data = marketData.find((d: any) => d.symbol === item.symbol);
        const Icon = item.icon;
        const changeColor = data?.change >= 0 ? "text-green-400" : "text-red-400";
        
        return (
          <Card key={item.symbol} className="trading-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-300 text-sm font-medium">{item.name}</h3>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-white font-mono">
                  {data ? `${item.unit}${Number(data.price).toFixed(2)}` : '--'}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${changeColor}`}>
                    {data ? `${data.change >= 0 ? '+' : ''}${Number(data.changePercent).toFixed(1)}%` : '--'}
                  </span>
                  <span className="text-xs text-slate-400">vs yesterday</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
