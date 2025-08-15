// src/components/games/RapidFireAnalogies.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, Clock, Target, TrendingUp, Brain, CheckCircle, XCircle } from 'lucide-react';

const RapidFireAnalogies = ({ onSpeechData, isActive, speechRecognition, difficulty = 1 }) => {
  const [gameState, setGameState] = useState('preparing');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [promptHistory, setPromptHistory] = useState([]);
  const [responseTimer, setResponseTimer] = useState(5);
  const [sessionTimer, setSessionTimer] = useState(60); // 1 minutes
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [cognitiveSpeed, setCognitiveSpeed] = useState(0);
  const [analogyQuality, setAnalogyQuality] = useState(0);
  
  const responseTimerRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const responseStartTime = useRef(null);
  const performanceMetrics = useRef({
    responseTimes: [],
    qualityScores: [],
    completedAnalogies: [],
    timeoutCount: 0
  });

  // Sophisticated analogy prompt database
  const analogyDatabase = {
    business: {
      beginner: [
        'Leadership is like...',
        'A successful team is like...',
        'Innovation is like...',
        'Customer service is like...',
        'Building trust is like...'
      ],
      intermediate: [
        'Strategic planning is like...',
        'Change management is like...',
        'Organizational culture is like...',
        'Market competition is like...',
        'Risk assessment is like...'
      ],
      advanced: [
        'Digital transformation is like...',
        'Stakeholder alignment is like...',
        'Disruptive innovation is like...',
        'Cross-functional collaboration is like...',
        'Sustainable growth is like...'
      ],
      expert: [
        'Ecosystem orchestration is like...',
        'Antifragile business models are like...',
        'Emergent strategy formation is like...',
        'Network effect amplification is like...',
        'Value constellation dynamics are like...'
      ]
    },
    psychology: {
      beginner: [
        'Confidence is like...',
        'Learning is like...',
        'Memory is like...',
        'Motivation is like...',
        'Stress is like...'
      ],
      intermediate: [
        'Emotional intelligence is like...',
        'Cognitive bias is like...',
        'Resilience is like...',
        'Flow state is like...',
        'Self-awareness is like...'
      ],
      advanced: [
        'Neuroplasticity is like...',
        'Metacognition is like...',
        'Psychological safety is like...',
        'Cognitive load theory is like...',
        'Behavioral conditioning is like...'
      ],
      expert: [
        'Constructive developmental theory is like...',
        'Embodied cognition is like...',
        'Predictive processing is like...',
        'Enactive perception is like...',
        'Phenomenological reduction is like...'
      ]
    },
    technology: {
      beginner: [
        'The internet is like...',
        'Data is like...',
        'Security is like...',
        'User interface is like...',
        'Cloud computing is like...'
      ],
      intermediate: [
        'Machine learning is like...',
        'Blockchain technology is like...',
        'API integration is like...',
        'Cybersecurity is like...',
        'Agile development is like...'
      ],
      advanced: [
        'Neural networks are like...',
        'Quantum computing is like...',
        'Edge computing is like...',
        'Microservices architecture is like...',
        'DevSecOps is like...'
      ],
      expert: [
        'Quantum entanglement in computing is like...',
        'Neuromorphic computing is like...',
        'Homomorphic encryption is like...',
        'Zero-knowledge proofs are like...',
        'Distributed consensus algorithms are like...'
      ]
    },
    creative: {
      beginner: [
        'Creativity is like...',
        'Inspiration is like...',
        'Art is like...',
        'Design is like...',
        'Storytelling is like...'
      ],
      intermediate: [
        'Creative process is like...',
        'Aesthetic judgment is like...',
        'Artistic vision is like...',
        'Creative collaboration is like...',
        'Innovative thinking is like...'
      ],
      advanced: [
        'Conceptual art is like...',
        'Postmodern aesthetics is like...',
        'Transmedia storytelling is like...',
        'Generative design is like...',
        'Synaesthetic experience is like...'
      ],
      expert: [
        'Phenomenological aesthetics is like...',
        'Deconstructive interpretation is like...',
        'Rhizomatic creativity is like...',
        'Apophatic expression is like...',
        'Liminal artistic space is like...'
      ]
    }
  };

  const difficultyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const categories = ['business', 'psychology', 'technology', 'creative'];

  // Initialize game
  useEffect(() => {
    if (isActive && gameState === 'preparing') {
      initializeGame();
    } else if (!isActive && gameState !== 'preparing') {
      terminateGame();
    }
  }, [isActive]);

  // Session timer
  useEffect(() => {
    if (gameState === 'active' && sessionTimer > 0) {
      sessionTimerRef.current = setInterval(() => {
        setSessionTimer(prev => {
          if (prev <= 1) {
            completeGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(sessionTimerRef.current);
    }
  }, [gameState, sessionTimer]);

  // Response timer
  useEffect(() => {
    if (gameState === 'active' && responseTimer > 0 && currentPrompt) {
      responseTimerRef.current = setInterval(() => {
        setResponseTimer(prev => {
          if (prev <= 1) {
            handleTimeout();
            return getResponseTime();
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(responseTimerRef.current);
    }
  }, [gameState, responseTimer, currentPrompt]);

  // Listen for speech responses
  useEffect(() => {
    if (speechRecognition?.transcript && gameState === 'active' && currentPrompt) {
      const recentTranscript = getRecentTranscript(speechRecognition.transcript);
      if (recentTranscript.length > 10) { // Minimum response length
        handleAnalogyResponse(recentTranscript);
      }
    }
  }, [speechRecognition?.transcript, gameState, currentPrompt]);

  const initializeGame = () => {
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalPrompts(0);
    setCognitiveSpeed(0);
    setAnalogyQuality(0);
    setPromptHistory([]);
    
    performanceMetrics.current = {
      responseTimes: [],
      qualityScores: [],
      completedAnalogies: [],
      timeoutCount: 0
    };
    
    setGameState('active');
    generateNextPrompt();
  };

  const generateNextPrompt = () => {
    // Select category and difficulty based on game difficulty and performance
    const category = categories[Math.floor(Math.random() * categories.length)];
    const difficultyIndex = Math.min(difficulty - 1, 3);
    const adjustedDifficulty = Math.min(3, difficultyIndex + Math.floor(streak / 5)); // Increase difficulty with streak
    
    const prompts = analogyDatabase[category][difficultyLevels[adjustedDifficulty]];
    
    // Avoid repeating recent prompts
    const recentPrompts = promptHistory.slice(-5).map(p => p.prompt);
    const availablePrompts = prompts.filter(p => !recentPrompts.includes(p));
    
    const selectedPrompt = availablePrompts.length > 0 ? 
      availablePrompts[Math.floor(Math.random() * availablePrompts.length)] :
      prompts[Math.floor(Math.random() * prompts.length)];
    
    setCurrentPrompt(selectedPrompt);
    setResponseTimer(getResponseTime());
    responseStartTime.current = Date.now();
    setTotalPrompts(prev => prev + 1);
    
    // Track prompt metadata
    const promptData = {
      prompt: selectedPrompt,
      category,
      difficulty: difficultyLevels[adjustedDifficulty],
      timestamp: Date.now()
    };
    
    setPromptHistory(prev => [...prev, promptData]);
  };

  const getResponseTime = () => {
    // Adjust response time based on difficulty
    const baseTimes = { beginner: 7, intermediate: 6, advanced: 5, expert: 4 };
    const currentDifficultyLevel = difficultyLevels[Math.min(difficulty - 1, 3)];
    return baseTimes[currentDifficultyLevel];
  };

  const getRecentTranscript = (fullTranscript) => {
    // Extract recent speech (last 3 seconds worth)
    const words = fullTranscript.split(' ');
    return words.slice(-20).join(' '); // Approximate recent content
  };

  const handleAnalogyResponse = (response) => {
    clearInterval(responseTimerRef.current);
    
    const responseTime = Date.now() - responseStartTime.current;
    const quality = evaluateAnalogyQuality(response, currentPrompt);
    
    // Calculate score based on speed and quality
    const speedBonus = Math.max(0, (getResponseTime() * 1000 - responseTime) / 100);
    const qualityPoints = quality * 50;
    const streakBonus = streak * 5;
    const totalPoints = Math.round(qualityPoints + speedBonus + streakBonus);
    
    setScore(prev => prev + totalPoints);
    
    if (quality > 0.6) {
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }
    
    // Update performance metrics
    performanceMetrics.current.responseTimes.push(responseTime);
    performanceMetrics.current.qualityScores.push(quality);
    performanceMetrics.current.completedAnalogies.push({
      prompt: currentPrompt,
      response,
      quality,
      responseTime,
      points: totalPoints,
      timestamp: Date.now()
    });
    
    // Update real-time metrics
    updateRealTimeMetrics();
    
    // Send data to parent
    onSpeechData({
      gameType: 'rapidFireAnalogies',
      event: 'analogy_completed',
      prompt: currentPrompt,
      response,
      quality,
      responseTime,
      points: totalPoints,
      streak,
      totalScore: score + totalPoints
    });
    
    // Generate next prompt
    setTimeout(() => {
      generateNextPrompt();
    }, 500);
  };

  const evaluateAnalogyQuality = (response, prompt) => {
    let qualityScore = 0.1; // Base score for attempting
    
    // Check for analogy structure ("like", "as", "similar to", etc.)
    const analogyPatterns = [/like/i, /as\s+\w+\s+as/i, /similar\s+to/i, /reminds\s+me\s+of/i, /comparable\s+to/i];
    const hasAnalogyStructure = analogyPatterns.some(pattern => pattern.test(response));
    
    if (hasAnalogyStructure) qualityScore += 0.3;
    
    // Check for explanation or elaboration
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 5);
    if (sentences.length > 1) qualityScore += 0.2;
    
    // Check for creative vocabulary
    const creativeWords = [
      'imagine', 'envision', 'consider', 'metaphor', 'symbolize', 'represent',
      'embody', 'mirror', 'reflect', 'parallel', 'resonate', 'echo'
    ];
    const hasCreativeVocabulary = creativeWords.some(word => 
      new RegExp(`\\b${word}\\b`, 'i').test(response)
    );
    
    if (hasCreativeVocabulary) qualityScore += 0.2;
    
    // Check for elaboration beyond the basic analogy
    if (response.length > 50) qualityScore += 0.1;
    if (response.length > 100) qualityScore += 0.1;
    
    // Penalize very short responses
    if (response.length < 15) qualityScore -= 0.2;
    
    return Math.max(0, Math.min(1, qualityScore));
  };

  const handleTimeout = () => {
    performanceMetrics.current.timeoutCount++;
    setStreak(0);
    
    onSpeechData({
      gameType: 'rapidFireAnalogies',
      event: 'timeout',
      prompt: currentPrompt,
      penalty: -10,
      totalScore: Math.max(0, score - 10)
    });
    
    setScore(prev => Math.max(0, prev - 10));
    
    setTimeout(() => {
      generateNextPrompt();
    }, 500);
  };

  const updateRealTimeMetrics = () => {
    // Calculate cognitive speed (responses per minute)
    const avgResponseTime = performanceMetrics.current.responseTimes.reduce((a, b) => a + b, 0) / 
                            performanceMetrics.current.responseTimes.length;
    const responsesPerMinute = (60000 / avgResponseTime) * 
                              (performanceMetrics.current.completedAnalogies.length / 
                               performanceMetrics.current.responseTimes.length);
    setCognitiveSpeed(Math.round(responsesPerMinute * 10) / 10);
    
    // Calculate average analogy quality
    const avgQuality = performanceMetrics.current.qualityScores.reduce((a, b) => a + b, 0) / 
                       performanceMetrics.current.qualityScores.length;
    setAnalogyQuality(Math.round(avgQuality * 100));
  };

  const completeGame = () => {
    setGameState('completed');
    
    clearInterval(sessionTimerRef.current);
    clearInterval(responseTimerRef.current);
    
    const completionRate = (performanceMetrics.current.completedAnalogies.length / totalPrompts) * 100;
    const avgQuality = performanceMetrics.current.qualityScores.length > 0 ?
      performanceMetrics.current.qualityScores.reduce((a, b) => a + b, 0) / 
      performanceMetrics.current.qualityScores.length : 0;
    
    onSpeechData({
      gameType: 'rapidFireAnalogies',
      event: 'game_completed',
      finalScore: score,
      maxStreak,
      completionRate: Math.round(completionRate),
      averageQuality: Math.round(avgQuality * 100),
      cognitiveSpeed,
      totalAnalogies: performanceMetrics.current.completedAnalogies.length,
      timeouts: performanceMetrics.current.timeoutCount
    });
  };

  const terminateGame = () => {
    setGameState('preparing');
    clearInterval(sessionTimerRef.current);
    clearInterval(responseTimerRef.current);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStreakColor = () => {
    if (streak >= 10) return 'text-purple-400';
    if (streak >= 5) return 'text-green-400';
    if (streak >= 3) return 'text-yellow-400';
    return 'text-gray-400';
  };

  if (gameState === 'preparing') {
    return (
      <div className="rapid-fire-card bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 rounded-xl shadow-2xl p-8 text-white">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Zap className="w-16 h-16 text-orange-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-black">{difficulty}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">Rapid Fire Analogies</h2>
            <p className="text-orange-200 text-lg">Cognitive Speed Training System</p>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 text-left">
            <h3 className="font-semibold mb-3 text-orange-300">Training Protocol:</h3>
            <ul className="space-y-2 text-sm text-orange-100">
              <li>• Complete analogies as quickly as possible</li>
              <li>• Build creative connections under time pressure</li>
              <li>• Maintain quality while increasing speed</li>
              <li>• Develop cognitive flexibility and fluency</li>
            </ul>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 text-left">
            <h3 className="font-semibold mb-3 text-orange-300">Scoring System:</h3>
            <ul className="space-y-1 text-sm text-orange-100">
              <li>• Quality points: Based on analogy structure and creativity</li>
              <li>• Speed bonus: Faster responses earn more points</li>
              <li>• Streak multiplier: Consecutive successes increase rewards</li>
              <li>• Timeout penalty: -10 points for missed responses</li>
            </ul>
          </div>
          
          <div className="text-sm text-orange-300">
            Difficulty Level {difficulty} • Duration: 2 minutes
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'completed') {
    const completionRate = (performanceMetrics.current.completedAnalogies.length / totalPrompts) * 100;

    return (
      <div className="rapid-fire-card bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 rounded-xl shadow-2xl p-8 text-white">
        <div className="text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
          
          <div>
            <h2 className="text-2xl font-bold mb-2">Training Completed</h2>
            <p className="text-green-200">Cognitive speed analysis complete</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{score}</div>
              <div className="text-sm text-green-200">Total Score</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">{maxStreak}</div>
              <div className="text-sm text-purple-200">Max Streak</div>
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 text-left">
            <h3 className="font-semibold mb-2 text-green-300">Performance Analysis:</h3>
            <div className="text-sm text-green-100 space-y-1">
              <div>Completion Rate: {Math.round(completionRate)}%</div>
              <div>Analogies Created: {performanceMetrics.current.completedAnalogies.length}</div>
              <div>Average Quality: {analogyQuality}%</div>
              <div>Cognitive Speed: {cognitiveSpeed} responses/min</div>
              <div>Timeouts: {performanceMetrics.current.timeoutCount}</div>
            </div>
          </div>
          
          <div className={`text-lg font-bold ${
            score >= 500 ? 'text-purple-400' :
            score >= 300 ? 'text-green-400' :
            score >= 200 ? 'text-yellow-400' :
            'text-orange-400'
          }`}>
            {score >= 500 ? 'Cognitive Master!' :
             score >= 300 ? 'Excellent Performance!' :
             score >= 200 ? 'Good Progress!' :
             'Keep Training!'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rapid-fire-game bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 rounded-xl shadow-2xl overflow-hidden">
      {/* Game Header */}
      <div className="game-header px-6 py-4 bg-black/30 border-b border-orange-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-orange-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Rapid Fire Analogies</h3>
              <div className="text-xs text-orange-300">Cognitive Speed Training</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-white font-mono">{formatTime(sessionTimer)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-white font-bold">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Prompt Display */}
      {currentPrompt && (
        <div className="prompt-display px-6 py-6 bg-gradient-to-r from-orange-900/60 to-red-900/60">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-orange-200 font-medium">Complete this analogy:</h4>
            <div className="response-timer">
              <div className={`text-2xl font-bold font-mono ${
                responseTimer <= 2 ? 'text-red-400 animate-pulse' :
                responseTimer <= 4 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {responseTimer}s
              </div>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <div className="inline-block bg-black/40 px-8 py-6 rounded-lg border-2 border-orange-400">
              <div className="text-2xl font-bold text-white mb-2">
                {currentPrompt}
              </div>
              <div className="text-orange-300 text-sm">
                Speak your analogy now!
              </div>
            </div>
          </div>
          
          <div className="response-timer-bar w-full bg-black/40 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                responseTimer <= 2 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                responseTimer <= 4 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-green-500 to-blue-500'
              }`}
              style={{ width: `${(responseTimer / getResponseTime()) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Performance Dashboard */}
      <div className="performance-dashboard px-6 py-4">
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="stat-card bg-black/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-orange-400">{score}</div>
            <div className="text-xs text-orange-300">Score</div>
          </div>
          <div className="stat-card bg-black/30 rounded-lg p-3 text-center">
            <div className={`text-lg font-bold ${getStreakColor()}`}>{streak}</div>
            <div className="text-xs text-gray-400">Streak</div>
          </div>
          <div className="stat-card bg-black/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">{cognitiveSpeed}</div>
            <div className="text-xs text-green-300">Speed</div>
          </div>
          <div className="stat-card bg-black/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-400">{analogyQuality}%</div>
            <div className="text-xs text-blue-300">Quality</div>
          </div>
        </div>

        {/* Streak Progress */}
        {streak > 0 && (
          <div className="streak-display bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-300 font-medium">
                🔥 Streak Active: {streak} consecutive successes!
              </span>
              <span className="text-xs text-purple-400">
                Max: {maxStreak}
              </span>
            </div>
            <div className="streak-bar w-full bg-purple-800 rounded-full h-2">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (streak / 10) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Recent Analogies */}
      {performanceMetrics.current.completedAnalogies.length > 0 && (
        <div className="recent-analogies px-6 py-4 bg-black/20 border-t border-orange-600/30">
          <h5 className="text-sm font-medium text-orange-300 mb-2">Recent Analogies:</h5>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {performanceMetrics.current.completedAnalogies.slice(-3).reverse().map((analogy, index) => (
              <div key={index} className="analogy-item bg-black/30 rounded p-2">
                <div className="flex items-start justify-between mb-1">
                  <div className="text-xs text-orange-200 font-medium truncate flex-1 mr-2">
                    {analogy.prompt}
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      analogy.quality > 0.8 ? 'bg-green-400' :
                      analogy.quality > 0.6 ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`} />
                    <span className="text-xs text-gray-400">
                      {Math.round(analogy.quality * 100)}%
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-300 truncate">
                  "{analogy.response}"
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">
                    {Math.round(analogy.responseTime / 1000 * 10) / 10}s
                  </span>
                  <span className="text-xs text-orange-400 font-medium">
                    +{analogy.points} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="progress-indicator px-6 py-4 bg-gradient-to-r from-orange-900/40 to-red-900/40 border-t border-orange-600/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-orange-300">Session Progress:</span>
          <span className="text-sm text-orange-400">
            {performanceMetrics.current.completedAnalogies.length} / {totalPrompts} completed
          </span>
        </div>
        
        <div className="progress-bar w-full bg-black/40 rounded-full h-2">
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full transition-all duration-500"
            style={{ 
              width: `${totalPrompts > 0 ? 
                (performanceMetrics.current.completedAnalogies.length / totalPrompts) * 100 : 0
              }%` 
            }}
          />
        </div>
      </div>

      {/* Tips */}
      <div className="tips-section px-6 py-4 bg-black/20 border-t border-orange-600/30">
        <h5 className="text-sm font-medium text-orange-300 mb-2">Quick Tips:</h5>
        <div className="text-xs text-orange-200 space-y-1">
          <div>• Use "like," "as," or "similar to" for clear analogies</div>
          <div>• Think of concrete examples and comparisons</div>
          <div>• Speed up by trusting your first instinct</div>
          <div>• Build streaks for maximum point multipliers</div>
        </div>
      </div>
    </div>
  );
};

export default RapidFireAnalogies;