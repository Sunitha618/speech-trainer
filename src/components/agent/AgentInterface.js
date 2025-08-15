// src/components/agent/AgentInterface.js
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Cpu, TrendingUp, Shield, Brain } from 'lucide-react';

const AgentInterface = ({ speechData, performanceMetrics, onRecommendation }) => {
  const [agentState, setAgentState] = useState('listening');
  const [currentInsight, setCurrentInsight] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState(0.85);

  const processingRef = useRef(null);
  const insightQueueRef = useRef([]);

  const agentPersonality = {
    analytical: {
      tone: 'precise',
      phrases: ['Based on voice pattern analysis', 'The data indicates', 'Performance metrics suggest'],
      focus: 'technical analysis'
    },
    supportive: {
      tone: 'encouraging',
      phrases: ['Your progress shows', 'This improvement demonstrates', 'Building on your strengths'],
      focus: 'motivation and growth'
    },
    strategic: {
      tone: 'forward-thinking',
      phrases: ['Consider adapting', 'Future sessions could benefit', 'Strategic development involves'],
      focus: 'long-term improvement'
    }
  };

  const [currentPersonality, setCurrentPersonality] = useState('analytical');

  useEffect(() => {
    if (speechData && performanceMetrics) {
      processIncomingData(speechData, performanceMetrics);
    }
  }, [speechData, performanceMetrics]);

  const processIncomingData = async (speech, metrics) => {
    setIsProcessing(true);
    const delay = 1200 + Math.random() * 800;
    processingRef.current = setTimeout(() => {
      const insight = generateContextualInsight(speech, metrics);
      deliverInsight(insight);
      setIsProcessing(false);
    }, delay);
  };

  const generateContextualInsight = (speech, metrics) => {
    const personality = agentPersonality[currentPersonality];
    const insights = [];

    if (speech.voiceMetrics) {
      const { stability, energy } = speech.voiceMetrics;
      if (stability > 0.8) {
        insights.push({
          type: 'strength',
          category: 'vocal_control',
          message: `${personality.phrases[1]} exceptional vocal stability at ${Math.round(
            stability * 100
          )}%.`,
          confidence: 0.92,
          actionable: 'Leverage this stability for advanced articulation practice'
        });
      }
      if (energy < 0.3) {
        insights.push({
          type: 'development',
          category: 'energy_modulation',
          message: `Energy levels are subdued at ${Math.round(energy * 100)}%. ${personality.phrases[2]}.`,
          confidence: 0.87,
          actionable: 'Practice graduated energy scales'
        });
      }
    }

    if (metrics.sessionHistory && metrics.sessionHistory.length > 2) {
      const trend = analyzePerfomanceTrend(metrics.sessionHistory.slice(-3));
      if (trend.direction === 'upward') {
        insights.push({
          type: 'progress',
          category: 'trajectory',
          message: `${personality.phrases[0]}, your trajectory shows ${trend.magnitude}% improvement.`,
          confidence: 0.89,
          actionable: 'Maintain training intensity'
        });
      }
    }

    if (speech.psychologyData?.stress) {
      const { recoveryPatterns } = speech.psychologyData.stress;
      if (recoveryPatterns?.length) {
        const avgRecovery = recoveryPatterns.reduce((s, p) => s + p.duration, 0) / recoveryPatterns.length;
        insights.push({
          type: 'resilience',
          category: 'stress_adaptation',
          message: `Stress recovery avg is ${avgRecovery < 5 ? 'rapid' : 'moderate'}.`,
          confidence: 0.84,
          actionable: 'Implement stress inoculation drills'
        });
      }
    }

    return insights.length > 0 ? selectOptimalInsight(insights) : generateFallbackInsight(personality);
  };

  const analyzePerfomanceTrend = (sessions) => {
    if (sessions.length < 2) return { direction: 'stable', magnitude: 0 };
    const s = sessions.map((s) => s.overallScore || s.averageConfidence || 0.5);
    const first = s.slice(0, s.length / 2).reduce((a, b) => a + b) / (s.length / 2);
    const second = s.slice(s.length / 2).reduce((a, b) => a + b) / (s.length / 2);
    const change = ((second - first) / first) * 100;
    return {
      direction: change > 5 ? 'upward' : change < -5 ? 'downward' : 'stable',
      magnitude: Math.round(Math.abs(change))
    };
  };

  const selectOptimalInsight = (insights) => {
    const priority = ['strength', 'progress', 'resilience', 'development'];
    insights.sort((a, b) => {
      const pa = priority.indexOf(a.type);
      const pb = priority.indexOf(b.type);
      return pa !== pb ? pa - pb : b.confidence - a.confidence;
    });
    return insights[0];
  };

  const generateFallbackInsight = (p) => ({
    type: 'observation',
    category: 'general',
    message: `${p.phrases[0]} continuous monitoring underway.`,
    confidence: 0.75,
    actionable: 'Continue consistent practice'
  });

  const deliverInsight = (insight) => {
    setCurrentInsight(insight.message);
    setConfidenceLevel(insight.confidence);

    const timestamp = new Date().toLocaleTimeString();
    setConversationHistory((prev) => [
      ...prev,
      {
        timestamp,
        type: insight.type,
        message: insight.message,
        actionable: insight.actionable,
        confidence: insight.confidence
      }
    ]);

    if (onRecommendation && insight.actionable) {
      onRecommendation({
        category: insight.category,
        recommendation: insight.actionable,
        confidence: insight.confidence
      });
    }

    rotatePersonality();
  };

  const rotatePersonality = () => {
    const personalities = ['analytical', 'supportive', 'strategic'];
    const idx = personalities.indexOf(currentPersonality);
    setCurrentPersonality(personalities[(idx + 1) % personalities.length]);
  };

  const getAgentMood = () => {
    if (isProcessing) return 'analyzing';
    if (confidenceLevel > 0.9) return 'confident';
    if (confidenceLevel > 0.7) return 'optimistic';
    return 'cautious';
  };

  const moodColor = {
    analyzing: 'from-blue-400 to-cyan-400',
    confident: 'from-green-400 to-emerald-400',
    optimistic: 'from-yellow-400 to-orange-400',
    cautious: 'from-gray-400 to-slate-400'
  };

  const clearHistory = () => {
    setConversationHistory([]);
    setCurrentInsight('');
  };

  return (
    <div className="neural-interface text-white rounded-xl shadow-xl overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      <div className="px-6 py-4 border-b border-slate-600 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${moodColor[getAgentMood()]}`} />
          <div>
            <h3 className="text-lg font-bold">Neural Advisor</h3>
            <p className="text-xs capitalize">{currentPersonality} • {Math.round(confidenceLevel * 100)}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Brain className="w-5 h-5" />
          {agentState === 'listening' ? 'Monitoring' : 'Processing'}
        </div>
      </div>

      <div className="px-6 py-5 min-h-[100px] bg-slate-800">
        {isProcessing ? (
          <p className="text-sm text-slate-300 animate-pulse">Analyzing speech…</p>
        ) : currentInsight ? (
          <p className="leading-snug text-sm">{currentInsight}</p>
        ) : (
          <p className="text-xs text-slate-500">Awaiting input…</p>
        )}
      </div>

      <div className="px-6 py-4 max-h-48 overflow-y-auto">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-slate-400 font-medium">Session Insights</span>
          {conversationHistory.length > 0 && (
            <button onClick={clearHistory} className="text-xs text-slate-500 hover:text-white">
              Clear
            </button>
          )}
        </div>
        {conversationHistory.slice(-5).map((entry, i) => (
          <div key={i} className="mb-2 text-xs p-2 bg-slate-900 rounded">
            <div className="flex justify-between">
              <span className="capitalize font-medium">{entry.type}</span>
              <span>{entry.timestamp}</span>
            </div>
            <p>{entry.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentInterface;
