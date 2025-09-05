import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "---FnFT7mHPO-IzK603ktT3BlbkFJ2zjohdMZUxJQq-DW50hvHjWnwVN_WaldJ5egQSbGPbS9X2N0hatfxMy8Qk9foWWSTDdkzXTBIA"
});

export interface MarketAnalysisRequest {
  marketData: any[];
  positions: any[];
  userQuery?: string;
  context?: string;
}

export interface MarketAnalysisResponse {
  insights: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    confidence: number;
    category: "alert" | "opportunity" | "risk";
  }[];
  recommendations: string[];
  riskAssessment: {
    level: "low" | "medium" | "high" | "extreme";
    factors: string[];
  };
}

export async function analyzeMarketConditions(request: MarketAnalysisRequest): Promise<MarketAnalysisResponse> {
  try {
    const prompt = `
You are an expert energy trading analyst. Analyze the following market data and provide insights:

Market Data: ${JSON.stringify(request.marketData)}
Current Positions: ${JSON.stringify(request.positions)}
User Query: ${request.userQuery || "General market analysis"}
Context: ${request.context || ""}

Provide analysis in JSON format with:
1. insights: Array of insights with title, description, priority (high/medium/low), confidence (0-100), category (alert/opportunity/risk)
2. recommendations: Array of actionable recommendations
3. riskAssessment: Object with level (low/medium/high/extreme) and factors array

Focus on energy trading specifics like volatility, geopolitical factors, weather impacts, supply/demand, and regulatory changes.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert energy trading analyst specializing in market analysis, risk assessment, and trading strategies. Respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as MarketAnalysisResponse;
  } catch (error) {
    throw new Error("Failed to analyze market conditions: " + error.message);
  }
}

export async function processUserQuery(query: string, context: any): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI trading assistant specializing in energy markets. Provide clear, actionable responses to trader queries. Focus on market analysis, risk management, and trading strategies."
        },
        {
          role: "user",
          content: `Query: ${query}\nContext: ${JSON.stringify(context)}`
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't process your query at this time.";
  } catch (error) {
    throw new Error("Failed to process user query: " + error.message);
  }
}

export async function generateRiskAnalysis(positions: any[], marketData: any[]): Promise<{
  varOneDay: number;
  varOneWeek: number;
  maxDrawdown: number;
  riskScore: number;
  recommendations: string[];
}> {
  try {
    const prompt = `
Analyze the risk of this energy trading portfolio:

Positions: ${JSON.stringify(positions)}
Market Data: ${JSON.stringify(marketData)}

Calculate and provide in JSON format:
1. varOneDay: 1-day Value at Risk in USD
2. varOneWeek: 1-week Value at Risk in USD  
3. maxDrawdown: Maximum potential drawdown in USD
4. riskScore: Risk score from 0-100
5. recommendations: Array of risk management recommendations

Consider energy market volatility, correlation breakdowns, margin requirements, and geopolitical factors.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a quantitative risk analyst specializing in energy trading. Provide accurate risk calculations in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    throw new Error("Failed to generate risk analysis: " + error.message);
  }
}
