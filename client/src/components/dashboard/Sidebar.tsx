import { 
  ChartLine, 
  Bot, 
  Database, 
  Shield, 
  PieChart, 
  Bell, 
  Zap 
} from "lucide-react";
import { Link, useLocation } from "wouter";

const menuItems = [
  { icon: ChartLine, label: "Dashboard", path: "/" },
  { icon: Bot, label: "AI Agents", path: "/ai-agents" },
  { icon: Database, label: "Market Data", path: "/market-data" },
  { icon: Shield, label: "Risk Analysis", path: "/risk-analysis" },
  { icon: PieChart, label: "Portfolio", path: "/portfolio" },
  { icon: Bell, label: "Alerts", path: "/alerts" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col sidebar-transition">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
            <Zap className="text-white w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold text-white">EnergiAI</h1>
        </div>
        <p className="text-slate-400 text-sm mt-1">Trading Intelligence</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => {
          const isActive = location === item.path;
          return (
            <Link
              key={index}
              href={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/20 glow-border"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80"
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="text-sm font-medium text-white">Alex Thompson</p>
            <p className="text-xs text-slate-400">Senior Trader</p>
          </div>
        </div>
      </div>
    </div>
  );
}
