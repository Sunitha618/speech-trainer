// src/components/games/ChaosIntegration.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shuffle, Clock, Target, Zap, AlertTriangle, CheckCircle, Brain } from 'lucide-react';

const ChaosIntegration = ({
  onSpeechData,
  isActive,
  speechRecognition,
  difficulty = 1,
  setSessionHistory // <-- dashboard injection
}) => {
  const [gameState, setGameState] = useState('preparing');
  const [mainTopic, setMainTopic] = useState('');
  const [chaosQueue, setChaosQueue] = useState([]);
  const [activeChaosWord, setActiveChaosWord] = useState(null);
  const [integrationTimer, setIntegrationTimer] = useState(0);
  const [sessionTimer, setSessionTimer] = useState(60); // 1 minute
  const [integrationScore, setIntegrationScore] = useState(0);
  const [chaosEvents, setChaosEvents] = useState([]);
  const [adaptabilityRating, setAdaptabilityRating] = useState(0);
  const [cognitiveLoad, setCognitiveLoad] = useState(0);

  const gameTimerRef = useRef(null);
  const integrationTimerRef = useRef(null);
  const chaosSchedulerRef = useRef(null);
  const adaptabilityTracker = useRef({ successes: 0, failures: 0, smoothness: [] });

  const chaosDatabase = {
    cognitive: {
      easy: [
        { word: 'elephant', category: 'animal', disruptionLevel: 1, neuralLoad: 0.2 },
        { word: 'bicycle', category: 'transport', disruptionLevel: 1, neuralLoad: 0.2 },
        { word: 'sunshine', category: 'weather', disruptionLevel: 1, neuralLoad: 0.1 }
      ],
      medium: [
        { word: 'paradox', category: 'abstract', disruptionLevel: 2, neuralLoad: 0.4 },
        { word: 'metamorphosis', category: 'process', disruptionLevel: 2, neuralLoad: 0.5 },
        { word: 'cryptocurrency', category: 'technology', disruptionLevel: 2, neuralLoad: 0.4 }
      ]
    }
  };

  const topicDatabase = [
    { topic: 'The future of sustainable technology', complexity: 2 },
    { topic: 'Leadership in times of uncertainty', complexity: 3 },
    { topic: 'The psychology of decision making', complexity: 4 }
  ];

  useEffect(() => {
    if (isActive && gameState === 'preparing') initializeGame();
    else if (!isActive && gameState !== 'preparing') terminateGame();
  }, [isActive]);

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

  useEffect(() => {
    if (activeChaosWord && integrationTimer > 0) {
      integrationTimerRef.current = setInterval(() => {
        setIntegrationTimer(prev => {
          if (prev <= 1) {
            handleIntegrationFailure();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(integrationTimerRef.current);
    }
  }, [activeChaosWord, integrationTimer]);

  useEffect(() => {
    if (speechRecognition?.transcript && activeChaosWord) {
      checkForWordIntegration(speechRecognition.transcript);
    }
  }, [speechRecognition?.transcript, activeChaosWord]);

  const initializeGame = () => {
    const selectedTopic = topicDatabase[Math.floor(Math.random() * topicDatabase.length)];
    setMainTopic(selectedTopic.topic);
    generateChaosQueue(difficulty);
    scheduleChaosEvents();
    setGameState('active');
    setIntegrationScore(0);
    setAdaptabilityRating(0);
    setCognitiveLoad(0);
    adaptabilityTracker.current = { successes: 0, failures: 0, smoothness: [] };
  };

  const generateChaosQueue = (difficultyLevel) => {
    const queue = [];
    const distribution = {
      1: { easy: 0.7, medium: 0.3 }
    }[difficultyLevel] || { easy: 1, medium: 0 };
    const count = Math.min(6, difficultyLevel + 3);

    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let level = rand > distribution.easy ? 'medium' : 'easy';
      const word = chaosDatabase.cognitive[level][Math.floor(Math.random() * chaosDatabase.cognitive[level].length)];
      queue.push({ ...word, id: `cw_${i}`, integrationWindow: 8 - word.disruptionLevel, scheduled: false });
    }
    setChaosQueue(queue);
  };

  const scheduleChaosEvents = () => {
    const scheduleNext = () => {
      const interval = 10000 + Math.random() * 20000;
      chaosSchedulerRef.current = setTimeout(() => {
        deployNextChaosWord();
        scheduleNext();
      }, interval);
    };
    chaosSchedulerRef.current = setTimeout(() => {
      deployNextChaosWord();
      scheduleNext();
    }, 5000);
  };

  const deployNextChaosWord = () => {
    const next = chaosQueue.find(c => !c.scheduled);
    if (!next || activeChaosWord) return;
    setActiveChaosWord(next);
    setIntegrationTimer(next.integrationWindow);
    setChaosQueue(prev => prev.map(c => (c.id === next.id ? { ...c, scheduled: true } : c)));

    // === SPEAK IT ALOUD (Text-to-Speech) ===
    try {
      const utter = new SpeechSynthesisUtterance(next.word);
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
    } catch (err) {
      console.warn("Speech synthesis not supported");
    }
  };

  const checkForWordIntegration = useCallback(
    (transcript) => {
      if (!activeChaosWord) return;
      if (transcript.toLowerCase().includes(activeChaosWord.word.toLowerCase())) {
        handleSuccessfulIntegration();
      }
    },
    [activeChaosWord]
  );

  const handleSuccessfulIntegration = () => {
    setIntegrationScore((s) => s + 100);
    adaptabilityTracker.current.successes++;
    clearInterval(integrationTimerRef.current);
    setActiveChaosWord(null);
    setIntegrationTimer(0);
  };

  const handleIntegrationFailure = () => {
    adaptabilityTracker.current.failures++;
    setIntegrationScore((s) => Math.max(0, s - 50));
    setActiveChaosWord(null);
    setIntegrationTimer(0);
  };

  const completeGame = () => {
    setGameState('completed');
    clearInterval(gameTimerRef.current);
    clearInterval(integrationTimerRef.current);
    clearTimeout(chaosSchedulerRef.current);

    const total = adaptabilityTracker.current.successes + adaptabilityTracker.current.failures;
    const successRate = total ? adaptabilityTracker.current.successes / total : 0;
    setAdaptabilityRating(Math.round(successRate * 100));

    const payload = {
      gameType: 'chaosIntegration',
      event: 'game_completed',
      finalScore: integrationScore,
      adaptabilityRating: Math.round(successRate * 100),
      successes: adaptabilityTracker.current.successes,
      failures: adaptabilityTracker.current.failures
    };

    onSpeechData(payload);
    if (setSessionHistory) {
      setSessionHistory(prev => [...prev, {
        date: new Date().toLocaleString(),
        gameType: 'chaosIntegration',
        stats: payload
      }]);
    }
  };

  const terminateGame = () => {
    setGameState('preparing');
    clearInterval(gameTimerRef.current);
    clearInterval(integrationTimerRef.current);
    clearTimeout(chaosSchedulerRef.current);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (gameState === 'preparing') {
    return (
      <div style={{ padding: 40, color: '#fff', background: 'purple' }}>
        <h2>Chaos Integration</h2>
        <p>Difficulty: {difficulty}</p>
      </div>
    );
  }

  if (gameState === 'completed') {
    return (
      <div style={{ padding: 40, color: '#fff', background: 'green' }}>
        <h2>Finished!</h2>
        <p>Score: {integrationScore}</p>
        <p>Adaptability: {adaptabilityRating}%</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, color: '#fff', background: '#41186d' }}>
      <div style={{ marginBottom: 10 }}>Topic: <strong>{mainTopic}</strong></div>
      <div>Time Left: {formatTime(sessionTimer)} | Score: {integrationScore}</div>

      {activeChaosWord && (
        <div style={{ marginTop: 30, padding: 25, background: 'rgba(255,0,0,0.2)', textAlign: 'center' }}>
          <div style={{ fontSize: 10, marginBottom: 6, color: '#ff8888' }}>CHAOS WORD</div>
          <div style={{
            fontSize: 56,
            fontWeight: 'bold',
            letterSpacing: 4,
            background: '#ff0044',
            padding: '12px 24px',
            borderRadius: '12px',
            display: 'inline-block'
          }}>
            {activeChaosWord.word.toUpperCase()}
          </div>
          <div style={{ marginTop: 10, fontSize: 12 }}>{integrationTimer}s left</div>
        </div>
      )}
    </div>
  );
};

export default ChaosIntegration;
