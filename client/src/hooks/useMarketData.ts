import { useQuery } from "@tanstack/react-query";

export function useMarketData() {
  return useQuery({
    queryKey: ["/api/market-data"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useMarketDataBySymbol(symbol: string) {
  return useQuery({
    queryKey: ["/api/market-data", symbol],
    refetchInterval: 30000,
  });
}
