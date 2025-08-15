// src/components/agent/RecoverySpecialistAgent.js
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Target, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

const RecoverySpecialistAgent = ({ speechAnalytics, stressMetrics, onInterventionTrigger }) => {
  const [recoveryState, setRecoveryState] = useState('monitoring');
  const [interventionQueue, setInterventionQueue] = useState([]);
  const [resilenceScore, setResilienceScore] = useState(75);
  const [activeProtocols, setActiveProtocols] = useState([]);
  const [biometricTrends, setBiometricTrends] = useState([]);
  
  const monitoringRef = useRef(null);
  const interventionHistoryRef = useRef([]);
  const baselineMetricsRef = useRef(null);

  // Advanced recovery protocols with specific triggers
  const recoveryProtocols = {
    respiratoryReset: {
      trigger: { stressLevel: 0.7, voiceStability: 0.4 },
      intervention: 'Implement 4-7-8 breathing pattern',
      duration: 30000, // 30 seconds
      priority: 'immediate',
      neuralTarget: 'parasympathetic activation'
    },
    cognitiveReframe: {
      trigger: { hesitationRate: 0.3, confidenceLevel: 0.4 },
      intervention: 'Cognitive restructuring with positive anchoring',
      duration: 45000,
      priority: 'high',
      neuralTarget: 'prefrontal cortex optimization'
    },
    energyModulation: {
      trigger: { energyLevel: 0.2, voiceVolume: 0.3 },
      intervention: 'Progressive energy escalation protocol',
      duration: 60000,
      priority: 'medium',
      neuralTarget: 'sympathetic nervous system'
    },
    flowStateInduction: {
      trigger: { stabilityConsistency: 0.8, stressLevel: 0.2 },
      intervention: 'Flow state optimization sequence',
      duration: 120000,
      priority: 'enhancement',
      neuralTarget: 'default mode network'
    },
    antifragilityBoost: {
      trigger: { recoverySpeed: 5000, adaptationScore: 0.6 },
      intervention: 'Stress inoculation with controlled challenge',
      duration: 180000,
      priority: 'development',
      neuralTarget: 'stress resilience pathways'
    }
  };

  const [currentProtocol, setCurrentProtocol] = useState(null);
  const [protocolProgress, setProtocolProgress] = useState(0);

  useEffect(() => {
    if (speechAnalytics && stressMetrics) {
      performContinuousMonitoring(speechAnalytics, stressMetrics);
    }
  }, [speechAnalytics, stressMetrics]);

  useEffect(() => {
    // Establish baseline if not set
    if (!baselineMetricsRef.current && speechAnalytics) {
      establishBaseline(speechAnalytics);
    }
  }, [speechAnalytics]);

  const establishBaseline = (analytics) => {
    baselineMetricsRef.current = {
      averageStability: analytics.voiceMetrics?.stability || 0.5,
      averageEnergy: analytics.voiceMetrics?.energy || 0.5,
      typicalHesitationRate: analytics.hesitationRate || 0.1,
      baselineConfidence: analytics.confidence || 0.5,
      timestamp: Date.now()
    };
  };

  const performContinuousMonitoring = (analytics, stress) => {
    const currentMetrics = extractCurrentMetrics(analytics, stress);
    updateBiometricTrends(currentMetrics);
    
    const riskAssessment = assessRecoveryRisk(currentMetrics);
    const interventionNeeded = evaluateInterventionNeed(riskAssessment);
    
    if (interventionNeeded.required) {
      initiateRecoveryProtocol(interventionNeeded.protocol, currentMetrics);
    }
    
    updateResilienceScoring(currentMetrics, riskAssessment);
  };

  const extractCurrentMetrics = (analytics, stress) => ({
    stressLevel: stress?.currentStressLevel || 0,
    voiceStability: analytics.voiceMetrics?.stability || 0,
    energyLevel: analytics.voiceMetrics?.energy || 0,
    voiceVolume: analytics.voiceMetrics?.volume || 0,
    hesitationRate: analytics.hesitationRate || 0,
    confidenceLevel: analytics.confidence || 0,
    recoverySpeed: stress?.recoveryPatterns?.[0]?.duration * 100 || 1000,
    adaptationScore: analytics.qualityAssessment?.overall || 0,
    stabilityConsistency: calculateStabilityConsistency(analytics),
    timestamp: Date.now()
  });

  const calculateStabilityConsistency = (analytics) => {
    if (!analytics.psychologyData?.flowState) return 0.5;
    return analytics.psychologyData.flowState.duration > 10 ? 0.8 : 0.4;
  };

  const updateBiometricTrends = (metrics) => {
    setBiometricTrends(prev => {
      const newTrends = [...prev, metrics].slice(-20); // Keep last 20 readings
      return newTrends;
    });
  };

  const assessRecoveryRisk = (metrics) => {
    const baseline = baselineMetricsRef.current;
    if (!baseline) return { level: 'unknown', factors: [] };

    const riskFactors = [];
    let riskScore = 0;

    // Stress level assessment
    if (metrics.stressLevel > 0.6) {
      riskFactors.push('elevated_stress');
      riskScore += 30;
    }

    // Performance degradation
    if (metrics.voiceStability < baseline.averageStability * 0.7) {
      riskFactors.push('stability_degradation');
      riskScore += 25;
    }

    // Energy depletion
    if (metrics.energyLevel < baseline.averageEnergy * 0.5) {
      riskFactors.push('energy_depletion');
      riskScore += 20;
    }

    // Confidence erosion
    if (metrics.confidenceLevel < baseline.baselineConfidence * 0.6) {
      riskFactors.push('confidence_erosion');
      riskScore += 25;
    }

    // Recovery speed issues
    if (metrics.recoverySpeed > 3000) {
      riskFactors.push('slow_recovery');
      riskScore += 15;
    }

    return {
      level: riskScore > 60 ? 'critical' : riskScore > 30 ? 'moderate' : 'low',
      score: riskScore,
      factors: riskFactors,
      recommendation: generateRiskRecommendation(riskScore, riskFactors)
    };
  };

  const generateRiskRecommendation = (score, factors) => {
    if (score > 60) {
      return 'Immediate intervention required - multiple performance indicators compromised';
    } else if (score > 30) {
      return 'Preventive measures recommended - early intervention optimal';
    }
    return 'Performance within acceptable parameters - continue monitoring';
  };

  const evaluateInterventionNeed = (riskAssessment) => {
    if (riskAssessment.level === 'critical') {
      return {
        required: true,
        protocol: selectOptimalProtocol(riskAssessment.factors),
        urgency: 'immediate'
      };
    } else if (riskAssessment.level === 'moderate') {
      return {
        required: true,
        protocol: selectPreventiveProtocol(riskAssessment.factors),
        urgency: 'preventive'
      };
    }
    
    return { required: false };
  };

  const selectOptimalProtocol = (riskFactors) => {
    // Priority-based protocol selection
    if (riskFactors.includes('elevated_stress') && riskFactors.includes('stability_degradation')) {
      return 'respiratoryReset';
    } else if (riskFactors.includes('confidence_erosion')) {
      return 'cognitiveReframe';
    } else if (riskFactors.includes('energy_depletion')) {
      return 'energyModulation';
    } else if (riskFactors.includes('slow_recovery')) {
      return 'antifragilityBoost';
    }
    
    return 'respiratoryReset'; // Default fallback
  };

  const selectPreventiveProtocol = (riskFactors) => {
    if (riskFactors.length === 0) {
      return 'flowStateInduction';
    }
    return selectOptimalProtocol(riskFactors);
  };

  const initiateRecoveryProtocol = (protocolName, currentMetrics) => {
    const protocol = recoveryProtocols[protocolName];
    if (!protocol) return;

    setCurrentProtocol({
      name: protocolName,
      ...protocol,
      startTime: Date.now(),
      triggerMetrics: currentMetrics
    });

    setRecoveryState('intervention');
    setProtocolProgress(0);

    // Start protocol timer
    const progressInterval = setInterval(() => {
      setProtocolProgress(prev => {
        const newProgress = prev + (100 / (protocol.duration / 1000));
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          completeProtocol(protocolName, currentMetrics);
          return 100;
        }
        return newProgress;
      });
    }, 1000);

    // Log intervention
    interventionHistoryRef.current.push({
      protocol: protocolName,
      timestamp: Date.now(),
      triggerMetrics: currentMetrics,
      urgency: protocol.priority
    });

    // Trigger external callback
    if (onInterventionTrigger) {
      onInterventionTrigger({
        protocol: protocolName,
        intervention: protocol.intervention,
        duration: protocol.duration,
        neuralTarget: protocol.neuralTarget
      });
    }
  };

  const completeProtocol = (protocolName, triggerMetrics) => {
    setCurrentProtocol(null);
    setRecoveryState('monitoring');
    setProtocolProgress(0);

    // Update intervention queue
    setInterventionQueue(prev => prev.filter(i => i.protocol !== protocolName));

    // Calculate effectiveness (would need post-intervention metrics in real implementation)
    const effectiveness = Math.random() * 0.4 + 0.6; // Simulated 60-100% effectiveness
    
    // Update resilience score based on successful intervention
    setResilienceScore(prev => Math.min(100, prev + (effectiveness * 5)));
  };

  const updateResilienceScoring = (metrics, riskAssessment) => {
    // Dynamic resilience calculation
    const stabilityComponent = metrics.voiceStability * 30;
    const recoveryComponent = Math.max(0, (5000 - metrics.recoverySpeed) / 5000) * 25;
    const adaptationComponent = metrics.adaptationScore * 25;
    const stressHandlingComponent = Math.max(0, (1 - metrics.stressLevel)) * 20;
    
    const newScore = stabilityComponent + recoveryComponent + adaptationComponent + stressHandlingComponent;
    setResilienceScore(Math.round(newScore));
  };

  const getRecoveryStateColor = () => {
    switch (recoveryState) {
      case 'intervention': return 'from-red-500 to-orange-500';
      case 'recovery': return 'from-yellow-500 to-green-500';
      case 'optimal': return 'from-green-500 to-blue-500';
      default: return 'from-blue-500 to-purple-500';
    }
  };

  const getResilienceGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: 'text-emerald-400', desc: 'Exceptional' };
    if (score >= 80) return { grade: 'A', color: 'text-green-400', desc: 'Excellent' };
    if (score >= 70) return { grade: 'B', color: 'text-blue-400', desc: 'Good' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-400', desc: 'Average' };
    return { grade: 'D', color: 'text-red-400', desc: 'Developing' };
  };

  const resilenceGrade = getResilienceGrade(resilenceScore);

  return (
    <div className="recovery-specialist-interface bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700">
      {/* Header with Status */}
      <div className="interface-header px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getRecoveryStateColor()} shadow-lg animate-pulse`}></div>
            <div>
              <h3 className="text-lg font-bold text-white">Recovery Specialist</h3>
              <p className="text-xs text-slate-400 capitalize">
                {recoveryState} • Neural pathway optimization
              </p>
            </div>
          </div>
          
          <div className="resilience-badge text-right">
            <div className={`text-2xl font-bold ${resilenceGrade.color}`}>
              {resilenceGrade.grade}
            </div>
            <div className="text-xs text-slate-400">Resilience</div>
          </div>
        </div>
      </div>

      {/* Active Protocol Display */}
      {currentProtocol && (
        <div className="active-protocol px-6 py-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 border-b border-orange-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-orange-300 font-medium text-sm">Active Intervention</span>
            </div>
            <span className="text-xs text-orange-400">
              {Math.round(protocolProgress)}% Complete
            </span>
          </div>
          
          <div className="space-y-2">
            <p className="text-white text-sm">{currentProtocol.intervention}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Target: {currentProtocol.neuralTarget}</span>
              <span className="text-orange-400">{currentProtocol.priority} priority</span>
            </div>
            
            <div className="protocol-progress-bar w-full bg-slate-700 rounded-full h-1 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000"
                style={{ width: `${protocolProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Biometric Monitoring */}
      <div className="biometric-display px-6 py-4">
        <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Real-time Biometric Analysis
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="metric-card bg-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Stress Level</span>
              <Target className="w-3 h-3 text-red-400" />
            </div>
            <div className="text-lg font-bold text-white">
              {Math.round((stressMetrics?.currentStressLevel || 0) * 100)}%
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
              <div 
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full transition-all duration-500"
                style={{ width: `${(stressMetrics?.currentStressLevel || 0) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="metric-card bg-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Recovery Speed</span>
              <TrendingUp className="w-3 h-3 text-green-400" />
            </div>
            <div className="text-lg font-bold text-white">
              {speechAnalytics?.psychologyData?.stress?.recoveryPatterns?.[0]?.duration || 'N/A'}ms
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {speechAnalytics?.psychologyData?.stress?.recoveryPatterns?.[0]?.duration < 1000 ? 'Excellent' : 'Developing'}
            </div>
          </div>
        </div>
      </div>

      {/* Intervention History */}
      <div className="intervention-history px-6 py-4 border-t border-slate-700">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Recent Interventions</h4>
        
        {interventionHistoryRef.current.length > 0 ? (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {interventionHistoryRef.current.slice(-3).map((intervention, index) => (
              <div key={index} className="intervention-item flex items-center justify-between p-2 bg-slate-800 rounded text-xs">
                <div className="flex items-center space-x-2">
                  {intervention.urgency === 'immediate' ? 
                    <AlertCircle className="w-3 h-3 text-red-400" /> :
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                  }
                  <span className="text-white capitalize">{intervention.protocol.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
                <span className="text-slate-400">
                  {new Date(intervention.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <AlertCircle className="w-6 h-6 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No interventions triggered yet</p>
          </div>
        )}
      </div>

      {/* Resilience Metrics */}
      <div className="resilience-footer px-6 py-4 bg-slate-900 border-t border-slate-700 rounded-b-xl">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className={`text-lg font-bold ${resilenceGrade.color}`}>
              {resilenceScore}
            </div>
            <div className="text-xs text-slate-400">Resilience Score</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-400">
              {biometricTrends.length}
            </div>
            <div className="text-xs text-slate-400">Data Points</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">
              {interventionHistoryRef.current.filter(i => i.urgency === 'immediate').length}
            </div>
            <div className="text-xs text-slate-400">Critical Saves</div>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <p className="text-xs text-slate-400">
            Neural adaptation status: <span className={resilenceGrade.color}>{resilenceGrade.desc}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecoverySpecialistAgent;