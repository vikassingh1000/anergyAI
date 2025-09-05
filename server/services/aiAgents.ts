import { storage } from "../storage";
import { analyzeMarketConditions, generateRiskAnalysis, processUserQuery } from "./openai";
import { fetchMarketData, fetchMarketNews, fetchWeatherData } from "./marketData";
import { InsertAiInsight, InsertAlertActivity } from "@shared/schema";

export interface AgentContext {
  userId: string;
  marketData: any[];
  positions: any[];
  news: any[];
  weather: any;
}

export class MarketAnalyzerAgent {
  async analyze(context: AgentContext): Promise<void> {
    try {
      const analysis = await analyzeMarketConditions({
        marketData: context.marketData,
        positions: context.positions,
        context: `News: ${JSON.stringify(context.news)}, Weather: ${JSON.stringify(context.weather)}`
      });

      // Create insights from analysis
      for (const insight of analysis.insights) {
        const aiInsight: InsertAiInsight = {
          userId: context.userId,
          agentType: "market_analyzer",
          title: insight.title,
          description: insight.description,
          priority: insight.priority,
          confidence: insight.confidence.toString(),
          category: insight.category,
          metadata: { recommendations: analysis.recommendations }
        };
        
        await storage.createAiInsight(aiInsight);

        // Create alert if high priority
        if (insight.priority === "high") {
          const alert: InsertAlertActivity = {
            userId: context.userId,
            type: "alert",
            description: insight.title,
            impact: insight.category === "risk" ? "High Risk" : "Neutral"
          };
          await storage.createAlertActivity(alert);
        }
      }
    } catch (error) {
      console.error("Market Analyzer Agent error:", error);
    }
  }
}

export class RiskManagerAgent {
  async analyze(context: AgentContext): Promise<void> {
    try {
      const riskAnalysis = await generateRiskAnalysis(context.positions, context.marketData);
      
      // Update risk metrics
      await storage.updateRiskMetrics(context.userId, {
        userId: context.userId,
        portfolioValue: this.calculatePortfolioValue(context.positions),
        varOneDay: riskAnalysis.varOneDay.toString(),
        varOneWeek: riskAnalysis.varOneWeek.toString(),
        maxDrawdown: riskAnalysis.maxDrawdown.toString(),
        riskScore: riskAnalysis.riskScore
      });

      // Create risk insights
      if (riskAnalysis.riskScore > 75) {
        const insight: InsertAiInsight = {
          userId: context.userId,
          agentType: "risk_manager",
          title: "High Portfolio Risk Detected",
          description: `Portfolio risk score is ${riskAnalysis.riskScore}%. Recommendations: ${riskAnalysis.recommendations.join(", ")}`,
          priority: "high",
          confidence: "95",
          category: "risk",
          metadata: { riskScore: riskAnalysis.riskScore, recommendations: riskAnalysis.recommendations }
        };
        
        await storage.createAiInsight(insight);
      }
    } catch (error) {
      console.error("Risk Manager Agent error:", error);
    }
  }

  private calculatePortfolioValue(positions: any[]): string {
    const totalValue = positions.reduce((sum, pos) => {
      const value = parseFloat(pos.quantity) * parseFloat(pos.currentPrice);
      return sum + (pos.type === "long" ? value : -value);
    }, 0);
    return totalValue.toString();
  }
}

export class NewsCorrelatorAgent {
  async analyze(context: AgentContext): Promise<void> {
    try {
      if (context.news.length === 0) return;

      const newsContext = context.news.map(n => `${n.title}: ${n.description}`).join("\n");
      const correlation = await processUserQuery(
        `Analyze how this news affects energy markets and correlate with current positions`,
        { news: newsContext, positions: context.positions, marketData: context.marketData }
      );

      const insight: InsertAiInsight = {
        userId: context.userId,
        agentType: "news_correlator",
        title: "News-Market Correlation Analysis",
        description: correlation,
        priority: "medium",
        confidence: "85",
        category: "insight",
        metadata: { newsCount: context.news.length }
      };
      
      await storage.createAiInsight(insight);
    } catch (error) {
      console.error("News Correlator Agent error:", error);
    }
  }
}

export class TradingExecutorAgent {
  async analyze(context: AgentContext): Promise<void> {
    try {
      // Check for auto-trading opportunities based on insights
      const insights = await storage.getAiInsights(context.userId, 5);
      const highPriorityInsights = insights.filter(i => i.priority === "high" && i.category === "opportunity");

      for (const insight of highPriorityInsights) {
        // Simulate trade execution (in real implementation, this would integrate with trading APIs)
        const tradeActivity: InsertAlertActivity = {
          userId: context.userId,
          type: "trade",
          description: `Auto-executed trade based on AI insight: ${insight.title}`,
          impact: "+$127K" // This would be calculated based on actual trade
        };
        
        await storage.createAlertActivity(tradeActivity);
      }
    } catch (error) {
      console.error("Trading Executor Agent error:", error);
    }
  }
}

export class AgentOrchestrator {
  private marketAnalyzer = new MarketAnalyzerAgent();
  private riskManager = new RiskManagerAgent();
  private newsCorrelator = new NewsCorrelatorAgent();
  private tradingExecutor = new TradingExecutorAgent();

  async runAnalysis(userId: string): Promise<void> {
    try {
      // Gather context data
      const positions = await storage.getPositions(userId);
      const marketData = await fetchMarketData();
      const news = await fetchMarketNews();
      const weather = await fetchWeatherData();

      // Store market data
      for (const data of marketData) {
        await storage.createMarketData({
          symbol: data.symbol,
          price: data.price.toString(),
          change: data.change.toString(),
          changePercent: data.changePercent.toString(),
          volume: data.volume?.toString() || null
        });
      }

      const context: AgentContext = {
        userId,
        marketData,
        positions,
        news,
        weather
      };

      // Run all agents concurrently
      await Promise.all([
        this.marketAnalyzer.analyze(context),
        this.riskManager.analyze(context),
        this.newsCorrelator.analyze(context),
        this.tradingExecutor.analyze(context)
      ]);

    } catch (error) {
      console.error("Agent Orchestrator error:", error);
    }
  }
}

export const agentOrchestrator = new AgentOrchestrator();
