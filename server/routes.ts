import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { agentOrchestrator } from "./services/aiAgents";
import { processUserQuery } from "./services/openai";
import { fetchMarketData } from "./services/marketData";
import { 
  insertUserSchema, 
  insertPositionSchema, 
  insertChatMessageSchema,
  insertAiInsightSchema,
  insertAlertActivitySchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store WebSocket connections by user ID
  const connections = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'auth' && data.userId) {
          connections.set(data.userId, ws);
          console.log(`User ${data.userId} connected to WebSocket`);
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    });

    ws.on('close', () => {
      // Remove connection
      for (const [userId, connection] of Array.from(connections.entries())) {
        if (connection === ws) {
          connections.delete(userId);
          break;
        }
      }
    });
  });

  // Broadcast updates to connected clients
  function broadcastToUser(userId: string, data: any) {
    const ws = connections.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  // Create default user for demo
  const defaultUser = await storage.getUserByUsername("trader");
  if (!defaultUser) {
    const user = await storage.createUser({
      username: "trader",
      password: "demo",
      name: "Alex Thompson",
      role: "senior_trader"
    });

    // Add sample positions
    await storage.createPosition({
      userId: user.id,
      symbol: "NATURAL_GAS",
      type: "long",
      quantity: "150000",
      entryPrice: "2.75",
      currentPrice: "2.82",
      unrealizedPnl: "10500"
    });

    await storage.createPosition({
      userId: user.id,
      symbol: "CRUDE_OIL", 
      type: "short",
      quantity: "50000",
      entryPrice: "75.20",
      currentPrice: "74.00",
      unrealizedPnl: "60000"
    });

    // Add sample AI insights
    await storage.createAiInsight({
      userId: user.id,
      agentType: "market_analyzer",
      title: "Volatility Spike Detected in Natural Gas",
      description: "Unusual trading volume and price movements suggest potential supply disruption. Consider risk management measures.",
      priority: "high",
      confidence: "92",
      category: "alert"
    });

    await storage.createAiInsight({
      userId: user.id,
      agentType: "risk_manager",
      title: "Portfolio Concentration Risk",
      description: "Current positions show 65% exposure to energy commodities. Diversification recommended.",
      priority: "medium",
      confidence: "87",
      category: "risk"
    });

    // Add sample activity
    await storage.createAlertActivity({
      userId: user.id,
      type: "alert",
      description: "High volatility detected in Natural Gas futures",
      impact: "Monitor closely"
    });

    await storage.createAlertActivity({
      userId: user.id,
      type: "trade",
      description: "Auto-executed hedge trade on crude oil position",
      impact: "+$15,300"
    });
  }

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ user: { id: user.id, username: user.username, name: user.name, role: user.role } });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Market data routes
  app.get("/api/market-data", async (req, res) => {
    try {
      const marketData = await storage.getMarketData();
      res.json(marketData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/market-data/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const data = await storage.getLatestMarketData(symbol);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Positions routes
  app.get("/api/positions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const positions = await storage.getPositions(userId);
      res.json(positions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/positions", async (req, res) => {
    try {
      const validatedData = insertPositionSchema.parse(req.body);
      const position = await storage.createPosition(validatedData);
      
      // Broadcast update
      broadcastToUser(position.userId, { type: 'position_update', data: position });
      
      res.json(position);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // AI Insights routes
  app.get("/api/insights/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const insights = await storage.getAiInsights(userId, limit);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Chat routes
  app.get("/api/chat/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getChatMessages(userId, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      const userMessage = await storage.createChatMessage(validatedData);
      
      // Process with AI and get response
      const positions = await storage.getPositions(validatedData.userId);
      const marketData = await storage.getMarketData();
      
      const aiResponse = await processUserQuery(validatedData.content, {
        positions,
        marketData,
        user: validatedData.userId
      });

      // Save AI response
      const aiMessage = await storage.createChatMessage({
        userId: validatedData.userId,
        type: "assistant",
        content: aiResponse,
        agentType: "trading_assistant"
      });

      // Broadcast both messages
      broadcastToUser(validatedData.userId, { 
        type: 'chat_messages', 
        data: [userMessage, aiMessage] 
      });
      
      res.json({ userMessage, aiMessage });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Risk metrics routes
  app.get("/api/risk/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const metrics = await storage.getRiskMetrics(userId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Activity routes
  app.get("/api/activity/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const activity = await storage.getAlertsActivity(userId, limit);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Trigger AI analysis
  app.post("/api/analyze/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Run agent analysis
      await agentOrchestrator.runAnalysis(userId);
      
      // Get updated insights and broadcast
      const insights = await storage.getAiInsights(userId, 10);
      const riskMetrics = await storage.getRiskMetrics(userId);
      const activity = await storage.getAlertsActivity(userId, 10);
      
      broadcastToUser(userId, { 
        type: 'analysis_complete', 
        data: { insights, riskMetrics, activity } 
      });
      
      res.json({ message: "Analysis completed" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Periodic market data updates
  setInterval(async () => {
    try {
      const marketData = await fetchMarketData();
      
      // Store new market data
      for (const data of marketData) {
        await storage.createMarketData({
          symbol: data.symbol,
          price: data.price.toString(),
          change: data.change.toString(),
          changePercent: data.changePercent.toString(),
          volume: data.volume?.toString() || null
        });
      }
      
      // Broadcast to all connected users
      for (const [userId, ws] of Array.from(connections.entries())) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'market_update', data: marketData }));
        }
      }
    } catch (error) {
      console.error("Market data update error:", error);
    }
  }, 30000); // Update every 30 seconds

  // Periodic AI analysis for active users
  setInterval(async () => {
    try {
      for (const userId of Array.from(connections.keys())) {
        await agentOrchestrator.runAnalysis(userId);
        
        const insights = await storage.getAiInsights(userId, 5);
        const latestInsights = insights.filter(i => 
          Date.now() - i.createdAt.getTime() < 60000 // Last minute
        );
        
        if (latestInsights.length > 0) {
          broadcastToUser(userId, { 
            type: 'new_insights', 
            data: latestInsights 
          });
        }
      }
    } catch (error) {
      console.error("Periodic AI analysis error:", error);
    }
  }, 60000); // Run every minute for active users

  return httpServer;
}
