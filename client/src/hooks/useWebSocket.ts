import { useState, useEffect, useRef } from "react";

interface WebSocketData {
  type: string;
  data: any;
}

export function useWebSocket(userId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [lastMessage, setLastMessage] = useState<WebSocketData | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  const connect = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        
        // Authenticate with user ID
        ws.current?.send(JSON.stringify({
          type: "auth",
          userId: userId
        }));
      };

      ws.current.onmessage = (event) => {
        try {
          const data: WebSocketData = JSON.parse(event.data);
          setLastMessage(data);
          
          switch (data.type) {
            case "market_update":
              setMarketData(data.data);
              break;
            case "new_insights":
              // Trigger refetch of insights
              window.dispatchEvent(new CustomEvent("refetch-insights"));
              break;
            case "analysis_complete":
              // Trigger refetch of all dashboard data
              window.dispatchEvent(new CustomEvent("refetch-all"));
              break;
            default:
              console.log("Received WebSocket message:", data);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.current.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeout.current = setTimeout(() => {
          console.log("Attempting to reconnect...");
          connect();
        }, 3000);
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [userId]);

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return {
    isConnected,
    marketData,
    lastMessage,
    sendMessage
  };
}
