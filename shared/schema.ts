import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("trader"),
});

export const positions = pgTable("positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  symbol: text("symbol").notNull(),
  type: text("type").notNull(), // "long" | "short"
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
  entryPrice: decimal("entry_price", { precision: 15, scale: 4 }).notNull(),
  currentPrice: decimal("current_price", { precision: 15, scale: 4 }).notNull(),
  unrealizedPnl: decimal("unrealized_pnl", { precision: 15, scale: 4 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export const marketData = pgTable("market_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull(),
  price: decimal("price", { precision: 15, scale: 4 }).notNull(),
  change: decimal("change", { precision: 5, scale: 2 }).notNull(),
  changePercent: decimal("change_percent", { precision: 5, scale: 2 }).notNull(),
  volume: decimal("volume", { precision: 15, scale: 4 }),
  timestamp: timestamp("timestamp").default(sql`now()`).notNull(),
});

export const aiInsights = pgTable("ai_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  agentType: text("agent_type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(), // "high" | "medium" | "low"
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
  category: text("category").notNull(), // "alert" | "opportunity" | "risk"
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  agentType: text("agent_type"), // null for user messages
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const riskMetrics = pgTable("risk_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  portfolioValue: decimal("portfolio_value", { precision: 15, scale: 2 }).notNull(),
  varOneDay: decimal("var_one_day", { precision: 15, scale: 2 }).notNull(),
  varOneWeek: decimal("var_one_week", { precision: 15, scale: 2 }).notNull(),
  maxDrawdown: decimal("max_drawdown", { precision: 15, scale: 2 }).notNull(),
  riskScore: integer("risk_score").notNull(), // 0-100
  lastUpdated: timestamp("last_updated").default(sql`now()`).notNull(),
});

export const alertsActivity = pgTable("alerts_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "alert" | "trade" | "insight"
  description: text("description").notNull(),
  impact: text("impact"), // monetary impact or "neutral"
  status: text("status").notNull().default("unread"), // "read" | "unread" | "acted"
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertPositionSchema = createInsertSchema(positions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMarketDataSchema = createInsertSchema(marketData).omit({ id: true, timestamp: true });
export const insertAiInsightSchema = createInsertSchema(aiInsights).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertRiskMetricSchema = createInsertSchema(riskMetrics).omit({ id: true, lastUpdated: true });
export const insertAlertActivitySchema = createInsertSchema(alertsActivity).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Position = typeof positions.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;
export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type RiskMetric = typeof riskMetrics.$inferSelect;
export type InsertRiskMetric = z.infer<typeof insertRiskMetricSchema>;
export type AlertActivity = typeof alertsActivity.$inferSelect;
export type InsertAlertActivity = z.infer<typeof insertAlertActivitySchema>;
