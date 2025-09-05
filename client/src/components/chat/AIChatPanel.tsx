import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  Mic, 
  Paperclip, 
  ChartLine, 
  Shield, 
  Globe,
  Bot,
  User
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AIChatPanelProps {
  userId: string;
}

const activeAgents = [
  {
    name: "Market Analyzer",
    description: "Monitoring volatility",
    icon: ChartLine,
    color: "bg-blue-500"
  },
  {
    name: "Risk Manager", 
    description: "Calculating VaR",
    icon: Shield,
    color: "bg-green-500"
  },
  {
    name: "News Correlator",
    description: "Processing sanctions data", 
    icon: Globe,
    color: "bg-orange-500"
  }
];

export default function AIChatPanel({ userId }: AIChatPanelProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/chat", userId],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      setIsTyping(true);
      const response = await apiRequest("POST", "/api/chat", {
        userId,
        type: "user",
        content
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", userId] });
      setMessage("");
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <MessageCircle className="text-white w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Trading Assistant</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full pulse-dot"></div>
              <span className="text-xs text-slate-400">{activeAgents.length} Agents Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Agents */}
      <div className="p-4 border-b border-slate-700">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Active AI Agents</h4>
        <div className="space-y-2">
          {activeAgents.map((agent, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 bg-slate-800/50 rounded-lg">
              <div className={`w-6 h-6 ${agent.color} rounded-full flex items-center justify-center`}>
                <agent.icon className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium text-white">{agent.name}</span>
                <div className="text-xs text-slate-400">{agent.description}</div>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full pulse-dot"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">Start a conversation with your AI trading assistant</p>
              <p className="text-slate-500 text-xs mt-2">Ask about market conditions, risk analysis, or trading strategies</p>
            </div>
          ) : (
            messages.map((msg: any) => (
              <div key={msg.id} className="flex space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.type === "user" 
                    ? "bg-slate-700" 
                    : "bg-gradient-to-br from-blue-500 to-green-500"
                }`}>
                  {msg.type === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`rounded-lg p-3 ${
                    msg.type === "user" 
                      ? "bg-blue-600 text-white" 
                      : "bg-slate-800 text-slate-200"
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-slate-400">
                      {msg.type === "user" ? "You" : (msg.agentType?.replace('_', ' ') || "AI Assistant")}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-slate-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs text-slate-400">AI is analyzing your query...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about market conditions, risk analysis, or trading strategies..."
            className="flex-1 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-4 mt-2">
          <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-slate-300 h-6 px-2">
            <Mic className="w-3 h-3 mr-1" />
            Voice
          </Button>
          <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-slate-300 h-6 px-2">
            <Paperclip className="w-3 h-3 mr-1" />
            Attach
          </Button>
          <span className="text-xs text-slate-500 ml-auto">Powered by GPT-4</span>
        </div>
      </div>
    </div>
  );
}
