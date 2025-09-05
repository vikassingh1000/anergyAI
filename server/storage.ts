import { 
  type User, 
  type InsertUser, 
  type Position, 
  type InsertPosition,
  type MarketData,
  type InsertMarketData,
  type AiInsight,
  type InsertAiInsight,
  type ChatMessage,
  type InsertChatMessage,
  type RiskMetric,
  type InsertRiskMetric,
  type AlertActivity,
  type InsertAlertActivity
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Positions
  getPositions(userId: string): Promise<Position[]>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: string, updates: Partial<Position>): Promise<Position | undefined>;
  deletePosition(id: string): Promise<boolean>;

  // Market Data
  getMarketData(symbol?: string): Promise<MarketData[]>;
  createMarketData(data: InsertMarketData): Promise<MarketData>;
  getLatestMarketData(symbol: string): Promise<MarketData | undefined>;

  // AI Insights
  getAiInsights(userId: string, limit?: number): Promise<AiInsight[]>;
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;

  // Chat Messages
  getChatMessages(userId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Risk Metrics
  getRiskMetrics(userId: string): Promise<RiskMetric | undefined>;
  updateRiskMetrics(userId: string, metrics: InsertRiskMetric): Promise<RiskMetric>;

  // Alerts & Activity
  getAlertsActivity(userId: string, limit?: number): Promise<AlertActivity[]>;
  createAlertActivity(activity: InsertAlertActivity): Promise<AlertActivity>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private positions: Map<string, Position>;
  private marketData: Map<string, MarketData>;
  private aiInsights: Map<string, AiInsight>;
  private chatMessages: Map<string, ChatMessage>;
  private riskMetrics: Map<string, RiskMetric>;
  private alertsActivity: Map<string, AlertActivity>;

  constructor() {
    this.users = new Map();
    this.positions = new Map();
    this.marketData = new Map();
    this.aiInsights = new Map();
    this.chatMessages = new Map();
    this.riskMetrics = new Map();
    this.alertsActivity = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getPositions(userId: string): Promise<Position[]> {
    return Array.from(this.positions.values()).filter(pos => pos.userId === userId);
  }

  async createPosition(insertPosition: InsertPosition): Promise<Position> {
    const id = randomUUID();
    const now = new Date();
    const position: Position = { 
      ...insertPosition, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.positions.set(id, position);
    return position;
  }

  async updatePosition(id: string, updates: Partial<Position>): Promise<Position | undefined> {
    const position = this.positions.get(id);
    if (!position) return undefined;
    
    const updatedPosition = { ...position, ...updates, updatedAt: new Date() };
    this.positions.set(id, updatedPosition);
    return updatedPosition;
  }

  async deletePosition(id: string): Promise<boolean> {
    return this.positions.delete(id);
  }

  async getMarketData(symbol?: string): Promise<MarketData[]> {
    const data = Array.from(this.marketData.values());
    return symbol ? data.filter(d => d.symbol === symbol) : data;
  }

  async createMarketData(insertData: InsertMarketData): Promise<MarketData> {
    const id = randomUUID();
    const data: MarketData = { 
      ...insertData, 
      id,
      timestamp: new Date()
    };
    this.marketData.set(id, data);
    return data;
  }

  async getLatestMarketData(symbol: string): Promise<MarketData | undefined> {
    const symbolData = Array.from(this.marketData.values())
      .filter(d => d.symbol === symbol)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return symbolData[0];
  }

  async getAiInsights(userId: string, limit = 10): Promise<AiInsight[]> {
    return Array.from(this.aiInsights.values())
      .filter(insight => insight.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createAiInsight(insertInsight: InsertAiInsight): Promise<AiInsight> {
    const id = randomUUID();
    const insight: AiInsight = { 
      ...insertInsight, 
      id,
      createdAt: new Date()
    };
    this.aiInsights.set(id, insight);
    return insight;
  }

  async getChatMessages(userId: string, limit = 50): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(-limit);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      ...insertMessage, 
      id,
      createdAt: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getRiskMetrics(userId: string): Promise<RiskMetric | undefined> {
    return Array.from(this.riskMetrics.values()).find(metric => metric.userId === userId);
  }

  async updateRiskMetrics(userId: string, insertMetrics: InsertRiskMetric): Promise<RiskMetric> {
    const existing = Array.from(this.riskMetrics.values()).find(metric => metric.userId === userId);
    const id = existing?.id || randomUUID();
    
    const metrics: RiskMetric = { 
      ...insertMetrics, 
      id,
      lastUpdated: new Date()
    };
    this.riskMetrics.set(id, metrics);
    return metrics;
  }

  async getAlertsActivity(userId: string, limit = 20): Promise<AlertActivity[]> {
    return Array.from(this.alertsActivity.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createAlertActivity(insertActivity: InsertAlertActivity): Promise<AlertActivity> {
    const id = randomUUID();
    const activity: AlertActivity = { 
      ...insertActivity, 
      id,
      createdAt: new Date()
    };
    this.alertsActivity.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
