// src/components/games/EnergyModulator.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, TrendingUp, Activity, Target, Timer, BarChart3, Waves } from 'lucide-react';

const EnergyModulator = ({ onSpeechData, isActive, voiceAnalytics, difficulty = 1 }) => {
  const [gameState, setGameState] = useState('calibrating');
  const [targetEnergyLevel, setTargetEnergyLevel] = useState(50);
  const [currentEnergyLevel, setCurrentEnergyLevel] = useState(0);
  const [energyHistory, setEnergyHistory] = useState([]);
  const [modulationSequence, setModulationSequence] = useState([]);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [sessionTimer, setSessionTimer] = useState(60); // 1 minutes
  const [transitionTimer, setTransitionTimer] = useState(8);
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [consistencyRating, setConsistencyRating] = useState(0);
  const [energyBandwidth, setEnergyBandwidth] = useState(20);
  
  const gameTimerRef = useRef(null);
  const transitionTimerRef = useRef(null);
  const baselineRef = useRef(null);
  const performanceMetrics = useRef({ 
    accuracyScores: [],
    transitionSmoothness: [],
    targetHits: 0,
    totalTransitions: 0
  });

  // Sophisticated energy modulation patterns
  const energyPatterns = {
    basic: {
      name: 'Linear Progression',
      sequence: [20, 40, 60, 80, 60, 40, 20],
      transitionTime: 10,
      description: 'Gradual energy changes'
    },
    intermediate: {
      name: 'Dynamic Waves',
      sequence: [30, 70, 25, 85, 45, 90, 35],
      transitionTime: 8,
      description: 'Varied energy peaks and valleys'
    },
    advanced: {
      name: 'Chaos Modulation',
      sequence: [15, 95, 30, 80, 10, 75, 50, 90, 25],
      transitionTime: 6,
      description: 'Rapid, unpredictable changes'
    },
    expert: {
      name: 'Neural Resonance',
      sequence: [40, 20, 85, 15, 95, 35, 70, 10, 90, 45],
      transitionTime: 5,
      description: 'Extreme precision required'
    },
    master: {
      name: 'Quantum Fluctuation',
      sequence: [25, 90, 10, 80, 35, 95, 15, 85, 40, 75, 20, 100, 5],
      transitionTime: 4,
      description: 'Maximum cognitive challenge'
    }
  };

  // Energy level characteristics with biometric targets
  const energyCharacteristics = {
    0: { name: 'Silent', color: 'gray', intensity: 'minimal', breathPattern: 'slow' },
    20: { name: 'Whisper', color: 'blue', intensity: 'very_low', breathPattern: 'calm' },
    40: { name: 'Conversational', color: 'green', intensity: 'moderate', breathPattern: 'normal' },
    60: { name: 'Engaged', color: 'yellow', intensity: 'elevated', breathPattern: 'active' },
    80: { name: 'Passionate', color: 'orange', intensity: 'high', breathPattern: 'dynamic' },
    100: { name: 'Electrifying', color: 'red', intensity: 'maximum', breathPattern: 'intense' }
  };

  // Initialize game based on difficulty
  useEffect(() => {
    if (isActive && gameState === 'calibrating') {
      initializeGame();
    } else if (!isActive && gameState !== 'calibrating') {
      terminateGame();
    }
  }, [isActive]);

  // Main game timer
  useEffect(() => {
    if (gameState === 'active' && sessionTimer > 0) {
      gameTimerRef.current = setInterval(() => {
        setSessionTimer(prev => {
          if (prev <= 1) {
            completeGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(gameTimerRef.current);
    }
  }, [gameState, sessionTimer]);

  // Transition timer for energy level changes
  useEffect(() => {
    if (gameState === 'active' && transitionTimer > 0) {
      transitionTimerRef.current = setInterval(() => {
        setTransitionTimer(prev => {
          if (prev <= 1) {
            progressToNextTarget();
            return getTransitionTime();
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(transitionTimerRef.current);
    }
  }, [gameState, transitionTimer]);

  // Monitor voice analytics for energy detection
  useEffect(() => {
    if (voiceAnalytics && gameState === 'active') {
      updateEnergyDetection(voiceAnalytics);
    }
  }, [voiceAnalytics, gameState]);

  const initializeGame = () => {
    // Select pattern based on difficulty
    const patternNames = ['basic', 'intermediate', 'advanced', 'expert', 'master'];
    const selectedPattern = energyPatterns[patternNames[Math.min(difficulty - 1, 4)]];
    
    setModulationSequence(selectedPattern.sequence);
    setTargetEnergyLevel(selectedPattern.sequence[0]);
    setSequenceIndex(0);
    setTransitionTimer(selectedPattern.transitionTime);
    setEnergyBandwidth(Math.max(10, 25 - (difficulty * 3))); // Tighter tolerance at higher levels
    
    // Reset metrics
    setAccuracyScore(0);
    setConsistencyRating(0);
    setEnergyHistory([]);
    performanceMetrics.current = {
      accuracyScores: [],
      transitionSmoothness: [],
      targetHits: 0,
      totalTransitions: 0
    };
    
    // Establish baseline if available
    if (voiceAnalytics?.voiceMetrics?.energy) {
      establishEnergyBaseline(voiceAnalytics.voiceMetrics.energy);
    }
    
    setGameState('active');
  };

  const establishEnergyBaseline = (initialEnergy) => {
    baselineRef.current = {
      baseEnergy: initialEnergy,
      calibrationTime: Date.now(),
      normalizedRange: { min: 0, max: 1 }
    };
  };

  const updateEnergyDetection = (analytics) => {
    if (!analytics.voiceMetrics) return;
    
    const { energy, volume, pitch, stability } = analytics.voiceMetrics;
    
    // Calculate composite energy level (0-100)
    const compositeEnergy = calculateCompositeEnergy(energy, volume, pitch, stability);
    setCurrentEnergyLevel(compositeEnergy);
    
    // Track energy history
    const energyPoint = {
      timestamp: Date.now(),
      energy: compositeEnergy,
      target: targetEnergyLevel,
      accuracy: calculateEnergyAccuracy(compositeEnergy, targetEnergyLevel),
      rawMetrics: { energy, volume, pitch, stability }
    };
    
    setEnergyHistory(prev => [...prev.slice(-30), energyPoint]); // Keep last 30 samples
    
    // Update performance metrics
    updatePerformanceMetrics(energyPoint);
  };

  const calculateCompositeEnergy = (energy, volume, pitch, stability) => {
    // Sophisticated energy calculation combining multiple voice characteristics
    const normalizedEnergy = Math.min(1, energy || 0);
    const normalizedVolume = Math.min(1, volume || 0);
    const normalizedPitch = Math.min(1, (pitch || 100) / 300); // Normalize pitch to 0-1
    const stabilityFactor = Math.min(1, stability || 0.5);
    
    // Weighted combination prioritizing energy and volume
    const compositeScore = (
      normalizedEnergy * 0.4 +
      normalizedVolume * 0.35 +
      normalizedPitch * 0.15 +
      stabilityFactor * 0.1
    );
    
    return Math.round(compositeScore * 100);
  };

  const calculateEnergyAccuracy = (current, target) => {
    const deviation = Math.abs(current - target);
    const maxDeviation = energyBandwidth;
    
    if (deviation <= maxDeviation) {
      return Math.max(0, 100 - (deviation / maxDeviation) * 100);
    }
    
    return Math.max(0, 100 - (deviation - maxDeviation) * 2);
  };

  const updatePerformanceMetrics = (energyPoint) => {
    const accuracy = energyPoint.accuracy;
    performanceMetrics.current.accuracyScores.push(accuracy);
    
    // Check if target was hit (within bandwidth)
    if (Math.abs(energyPoint.energy - energyPoint.target) <= energyBandwidth) {
      performanceMetrics.current.targetHits++;
    }
    
    // Calculate transition smoothness if we have previous data
    if (energyHistory.length > 0) {
      const previousPoint = energyHistory[energyHistory.length - 1];
      const energyChange = Math.abs(energyPoint.energy - previousPoint.energy);
      const targetChange = Math.abs(energyPoint.target - previousPoint.target);
      
      // Smooth transitions should match the target change rate
      const smoothness = targetChange > 0 ? 
        Math.max(0, 100 - Math.abs(energyChange - targetChange) * 2) : 
        Math.max(0, 100 - energyChange * 3);
        
      performanceMetrics.current.transitionSmoothness.push(smoothness);
    }
    
    // Update real-time scores
    const avgAccuracy = performanceMetrics.current.accuracyScores.reduce((a, b) => a + b, 0) / 
                       performanceMetrics.current.accuracyScores.length;
    setAccuracyScore(Math.round(avgAccuracy));
    
    const avgSmoothness = performanceMetrics.current.transitionSmoothness.length > 0 ?
                         performanceMetrics.current.transitionSmoothness.reduce((a, b) => a + b, 0) / 
                         performanceMetrics.current.transitionSmoothness.length : 0;
    setConsistencyRating(Math.round(avgSmoothness));
  };

  const progressToNextTarget = () => {
    performanceMetrics.current.totalTransitions++;
    
    const nextIndex = (sequenceIndex + 1) % modulationSequence.length;
    setSequenceIndex(nextIndex);
    setTargetEnergyLevel(modulationSequence[nextIndex]);
    
    // Send transition data
    onSpeechData({
      gameType: 'energyModulator',
      event: 'target_transition',
      previousTarget: modulationSequence[sequenceIndex],
      newTarget: modulationSequence[nextIndex],
      currentEnergy: currentEnergyLevel,
      accuracy: performanceMetrics.current.accuracyScores.slice(-1)[0] || 0,
      transitionNumber: performanceMetrics.current.totalTransitions
    });
  };

  const getTransitionTime = () => {
    const pattern = Object.values(energyPatterns).find(p => 
      JSON.stringify(p.sequence) === JSON.stringify(modulationSequence)
    );
    return pattern?.transitionTime || 8;
  };

  const completeGame = () => {
    setGameState('completed');
    
    // Calculate final scores
    const hitRate = performanceMetrics.current.totalTransitions > 0 ?
      (performanceMetrics.current.targetHits / performanceMetrics.current.totalTransitions) * 100 : 0;
    
    const overallScore = Math.round((accuracyScore * 0.6) + (consistencyRating * 0.4));
    
    // Clear timers
    clearInterval(gameTimerRef.current);
    clearInterval(transitionTimerRef.current);
    
    // Send completion data
    onSpeechData({
      gameType: 'energyModulator',
      event: 'game_completed',
      finalAccuracy: accuracyScore,
      finalConsistency: consistencyRating,
      targetHitRate: Math.round(hitRate),
      overallScore,
      totalTransitions: performanceMetrics.current.totalTransitions,
      energyBandwidthUsed: energyBandwidth,
      difficultyLevel: difficulty
    });
  };

  const terminateGame = () => {
    setGameState('calibrating');
    clearInterval(gameTimerRef.current);
    clearInterval(transitionTimerRef.current);
  };

  const getEnergyColor = (level) => {
    if (level < 20) return 'from-gray-500 to-gray-600';
    if (level < 40) return 'from-blue-500 to-blue-600';
    if (level < 60) return 'from-green-500 to-green-600';
    if (level < 80) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  const getTargetCharacteristic = (level) => {
    const closest = Object.keys(energyCharacteristics)
      .map(Number)
      .reduce((prev, curr) => 
        Math.abs(curr - level) < Math.abs(prev - level) ? curr : prev
      );
    return energyCharacteristics[closest];
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return 'text-emerald-400';
    if (accuracy >= 75) return 'text-green-400';
    if (accuracy >= 60) return 'text-yellow-400';
    if (accuracy >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'calibrating') {
    const currentPattern = Object.values(energyPatterns).find(p => 
      JSON.stringify(p.sequence) === JSON.stringify(modulationSequence)
    ) || energyPatterns.basic;

    return (
      <div className="energy-modulator-card bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 rounded-xl shadow-2xl p-8 text-white">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Zap className="w-16 h-16 text-cyan-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-black">{difficulty}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">Energy Modulation Training</h2>
            <p className="text-cyan-200 text-lg">Vocal Dynamics Mastery Protocol</p>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 text-left">
            <h3 className="font-semibold mb-3 text-cyan-300">Selected Pattern:</h3>
            <div className="space-y-2">
              <div className="text-white font-medium">{currentPattern.name}</div>
              <div className="text-sm text-cyan-200">{currentPattern.description}</div>
              <div className="text-xs text-cyan-300">
                Transition Time: {currentPattern.transitionTime}s • 
                Bandwidth: ±{energyBandwidth} points
              </div>
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 text-left">
            <h3 className="font-semibold mb-3 text-cyan-300">Training Objectives:</h3>
            <ul className="space-y-2 text-sm text-cyan-100">
              <li>• Match target energy levels using vocal dynamics</li>
              <li>• Maintain smooth transitions between energy states</li>
              <li>• Develop precise vocal control and awareness</li>
              <li>• Build consistent energy modulation skills</li>
            </ul>
          </div>
          
          <div className="text-sm text-cyan-300">
            Difficulty Level {difficulty} • Duration: 4 minutes
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'completed') {
    const hitRate = performanceMetrics.current.totalTransitions > 0 ?
      (performanceMetrics.current.targetHits / performanceMetrics.current.totalTransitions) * 100 : 0;
    const overallScore = Math.round((accuracyScore * 0.6) + (consistencyRating * 0.4));

    return (
      <div className="energy-modulator-card bg-gradient-to-br from-green-900 via-cyan-900 to-blue-900 rounded-xl shadow-2xl p-8 text-white">
        <div className="text-center space-y-6">
          <Activity className="w-16 h-16 text-cyan-400 mx-auto" />
          
          <div>
            <h2 className="text-2xl font-bold mb-2">Training Completed</h2>
            <p className="text-cyan-200">Vocal dynamics analysis complete</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-cyan-400">{accuracyScore}%</div>
              <div className="text-sm text-cyan-200">Accuracy Score</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{consistencyRating}%</div>
              <div className="text-sm text-green-200">Consistency Rating</div>
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 text-left">
            <h3 className="font-semibold mb-2 text-cyan-300">Performance Analysis:</h3>
            <div className="text-sm text-cyan-100 space-y-1">
              <div>Target Hit Rate: {Math.round(hitRate)}%</div>
              <div>Total Transitions: {performanceMetrics.current.totalTransitions}</div>
              <div>Overall Score: {overallScore}/100</div>
              <div>Energy Bandwidth: ±{energyBandwidth} points</div>
            </div>
          </div>
          
          <div className={`text-lg font-bold ${
            overallScore >= 85 ? 'text-emerald-400' :
            overallScore >= 70 ? 'text-green-400' :
            overallScore >= 55 ? 'text-yellow-400' :
            'text-orange-400'
          }`}>
            {overallScore >= 85 ? 'Excellent Mastery!' :
             overallScore >= 70 ? 'Strong Performance!' :
             overallScore >= 55 ? 'Good Progress!' :
             'Keep Training!'}
          </div>
        </div>
      </div>
    );
  }

  const targetChar = getTargetCharacteristic(targetEnergyLevel);
  const currentAccuracy = energyHistory.length > 0 ? 
    energyHistory[energyHistory.length - 1].accuracy : 0;

  return (
    <div className="energy-modulator-game bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900 rounded-xl shadow-2xl overflow-hidden">
      {/* Game Header */}
      <div className="game-header px-6 py-4 bg-black/30 border-b border-cyan-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Waves className="w-6 h-6 text-cyan-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Energy Modulator</h3>
              <div className="text-xs text-cyan-300">Vocal Dynamics Training</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Timer className="w-4 h-4 text-blue-400" />
              <span className="text-white font-mono">{formatTime(sessionTimer)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <BarChart3 className="w-4 h-4 text-green-400" />
              <span className="text-white font-bold">{accuracyScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Energy Display */}
      <div className="target-display px-6 py-5 bg-gradient-to-r from-cyan-900/60 to-blue-900/60">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-cyan-200 font-medium">Target Energy Level:</h4>
          <div className="text-cyan-300 font-mono text-lg">
            {transitionTimer}s remaining
          </div>
        </div>
        
        <div className="text-center mb-4">
          <div className="inline-block bg-black/40 px-8 py-4 rounded-lg border-2 border-cyan-400">
            <div className="text-4xl font-bold text-white mb-1">
              {targetEnergyLevel}%
            </div>
            <div className="text-lg text-cyan-300 font-medium">
              {targetChar.name}
            </div>
            <div className="text-sm text-cyan-400 mt-1">
              {targetChar.intensity} • {targetChar.breathPattern}
            </div>
          </div>
        </div>
        
        <div className="energy-target-bar w-full bg-black/40 rounded-full h-4 overflow-hidden border border-cyan-500/50">
          <div 
            className={`h-full bg-gradient-to-r ${getEnergyColor(targetEnergyLevel)} transition-all duration-1000`}
            style={{ width: `${targetEnergyLevel}%` }}
          />
        </div>
      </div>

      {/* Current Energy Monitor */}
      <div className="current-energy px-6 py-4 bg-black/20">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-medium">Your Current Energy:</h4>
          <div className="flex items-center space-x-2">
            <span className={`text-lg font-bold ${getAccuracyColor(currentAccuracy)}`}>
              {Math.round(currentAccuracy)}%
            </span>
            <span className="text-xs text-gray-400">accuracy</span>
          </div>
        </div>
        
        <div className="current-energy-display bg-black/30 rounded-lg p-4 mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl font-bold text-white">
              {currentEnergyLevel}%
            </span>
            <div className="text-right">
              <div className="text-sm text-gray-300">Deviation:</div>
              <div className={`text-lg font-bold ${
                Math.abs(currentEnergyLevel - targetEnergyLevel) <= energyBandwidth ? 
                'text-green-400' : 'text-red-400'
              }`}>
                {Math.abs(currentEnergyLevel - targetEnergyLevel)} pts
              </div>
            </div>
          </div>
          
          <div className="energy-current-bar w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getEnergyColor(currentEnergyLevel)} transition-all duration-300`}
              style={{ width: `${currentEnergyLevel}%` }}
            />
          </div>
          
          {/* Target Zone Indicator */}
          <div className="relative mt-2">
            <div className="w-full h-2 bg-gray-800 rounded-full">
              <div 
                className="absolute h-2 bg-green-400/30 rounded-full border border-green-400"
                style={{ 
                  left: `${Math.max(0, targetEnergyLevel - energyBandwidth)}%`,
                  width: `${Math.min(100, energyBandwidth * 2)}%`
                }}
              />
            </div>
            <div className="text-xs text-green-400 mt-1 text-center">
              Target Zone: {Math.max(0, targetEnergyLevel - energyBandwidth)}% - {Math.min(100, targetEnergyLevel + energyBandwidth)}%
            </div>
          </div>
        </div>
      </div>

      {/* Energy Sequence Progress */}
      <div className="sequence-progress px-6 py-4 bg-gradient-to-r from-blue-900/40 to-cyan-900/40">
        <h4 className="text-cyan-200 font-medium mb-3">Modulation Sequence:</h4>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {modulationSequence.map((level, index) => (
            <div
              key={index}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                index === sequenceIndex 
                  ? 'bg-cyan-500 text-white ring-2 ring-cyan-300' 
                  : index < sequenceIndex 
                    ? 'bg-green-600/60 text-green-200' 
                    : 'bg-black/40 text-gray-400'
              }`}
            >
              {level}%
            </div>
          ))}
        </div>
        <div className="text-xs text-cyan-400 mt-2">
          Step {sequenceIndex + 1} of {modulationSequence.length} • 
          Next transition in {transitionTimer}s
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="performance-metrics px-6 py-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="metric-card bg-black/30 rounded-lg p-3 text-center">
            <div className={`text-lg font-bold ${getAccuracyColor(accuracyScore)}`}>
              {accuracyScore}%
            </div>
            <div className="text-xs text-gray-400">Avg Accuracy</div>
          </div>
          <div className="metric-card bg-black/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-400">
              {consistencyRating}%
            </div>
            <div className="text-xs text-gray-400">Consistency</div>
          </div>
          <div className="metric-card bg-black/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">
              {performanceMetrics.current.targetHits}
            </div>
            <div className="text-xs text-gray-400">Target Hits</div>
          </div>
        </div>

        {/* Energy History Visualization */}
        {energyHistory.length > 5 && (
          <div className="energy-history bg-black/30 rounded-lg p-3">
            <h5 className="text-sm font-medium text-cyan-300 mb-2">Energy Trend:</h5>
            <div className="flex items-end space-x-1 h-16">
              {energyHistory.slice(-20).map((point, index) => (
                <div
                  key={index}
                  className="flex-1 bg-cyan-500/60 rounded-t transition-all duration-300"
                  style={{ 
                    height: `${Math.max(2, (point.energy / 100) * 64)}px`,
                    backgroundColor: point.accuracy > 75 ? 
                      'rgba(34, 197, 94, 0.6)' : 
                      point.accuracy > 50 ? 
                        'rgba(234, 179, 8, 0.6)' : 
                        'rgba(239, 68, 68, 0.6)'
                  }}
                />
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Last 20 samples • Green: High accuracy, Yellow: Medium, Red: Low
            </div>
          </div>
        )}
      </div>

      {/* Voice Coaching Tips */}
      <div className="coaching-tips px-6 py-4 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border-t border-cyan-600/30">
        <h5 className="text-sm font-medium text-cyan-300 mb-2">Energy Modulation Techniques:</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-cyan-200">
          <div className="tip-card bg-black/20 rounded p-2">
            <div className="font-medium text-cyan-300">Low Energy (0-40%):</div>
            <div>Soft voice, controlled breathing, measured pace</div>
          </div>
          <div className="tip-card bg-black/20 rounded p-2">
            <div className="font-medium text-cyan-300">High Energy (60-100%):</div>
            <div>Strong projection, dynamic breathing, varied pitch</div>
          </div>
        </div>
      </div>

      {/* Real-time Feedback */}
      <div className="real-time-feedback px-6 py-4 bg-black/20 border-t border-cyan-600/30">
        <div className="flex items-center justify-between">
          <div className="feedback-status">
            {Math.abs(currentEnergyLevel - targetEnergyLevel) <= energyBandwidth ? (
              <div className="flex items-center space-x-2 text-green-400">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">On Target!</span>
              </div>
            ) : currentEnergyLevel > targetEnergyLevel + energyBandwidth ? (
              <div className="flex items-center space-x-2 text-orange-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Too High - Reduce Energy</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-blue-400">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Too Low - Increase Energy</span>
              </div>
            )}
          </div>
          
          <div className="next-target text-right">
            <div className="text-xs text-gray-400">Next Target:</div>
            <div className="text-sm font-bold text-cyan-400">
              {modulationSequence[(sequenceIndex + 1) % modulationSequence.length]}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyModulator;