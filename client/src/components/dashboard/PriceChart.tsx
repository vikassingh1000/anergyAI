import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PriceChartProps {
  isVolatility?: boolean;
}

export default function PriceChart({ isVolatility = false }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { data: marketData = [] } = useQuery({
    queryKey: ["/api/market-data"],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Generate mock time series data
    const dataPoints = 24;
    const data = Array.from({ length: dataPoints }, (_, i) => {
      if (isVolatility) {
        return 15 + Math.random() * 70 + Math.sin(i / 4) * 20;
      } else {
        return 2.8 + Math.sin(i / 6) * 0.3 + (Math.random() - 0.5) * 0.2;
      }
    });

    const padding = 40;
    const chartWidth = canvas.offsetWidth - padding * 2;
    const chartHeight = canvas.offsetHeight - padding * 2;

    // Draw grid
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // Draw data line
    if (data.length > 0) {
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min;
      
      ctx.strokeStyle = isVolatility ? '#F59E0B' : '#3B82F6';
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((value, index) => {
        const x = padding + (chartWidth / (dataPoints - 1)) * index;
        const y = padding + chartHeight - ((value - min) / range) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();

      // Fill area under curve
      if (isVolatility) {
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#F59E0B';
        ctx.lineTo(padding + chartWidth, padding + chartHeight);
        ctx.lineTo(padding, padding + chartHeight);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Draw labels
    ctx.fillStyle = '#64748B';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    
    // X-axis labels
    const timeLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
    timeLabels.forEach((label, index) => {
      const x = padding + (chartWidth / (timeLabels.length - 1)) * index;
      ctx.fillText(label, x, canvas.offsetHeight - 10);
    });

  }, [marketData, isVolatility]);

  return (
    <Card className="trading-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">
            {isVolatility ? "Market Volatility" : "Price Trends"}
          </CardTitle>
          {!isVolatility && (
            <div className="flex space-x-2">
              <Button variant="default" size="sm" className="bg-blue-600 text-white">1D</Button>
              <Button variant="ghost" size="sm" className="text-slate-400">1W</Button>
              <Button variant="ghost" size="sm" className="text-slate-400">1M</Button>
            </div>
          )}
          {isVolatility && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span className="text-sm text-slate-300">High Risk Period</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
