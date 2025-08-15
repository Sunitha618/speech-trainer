import React, { useState } from 'react';
import './App.css';

// hooks
import useSpeechRecognition from './hooks/useSpeechRecognition';
import useVoiceAnalysis from './hooks/useVoiceAnalysis';

// utils
import { derivePsychologyMetrics } from './utils/psychologyMetrics';

// agents
import AgentInterface from './components/agent/AgentInterface';
import RecoverySpecialistAgent from './components/agent/RecoverySpecialistAgent';

// games
import ChaosIntegration from './components/games/ChaosIntegration';
import EnergyModulator from './components/games/EnergyModulator';
import RapidFireAnalogies from './components/games/RapidFireAnalogies';

// dashboard
import Dashboard from './components/Dashboard';

function App() {
  const [activeGame, setActiveGame] = useState(null);
  const [difficulty, setDifficulty] = useState(1);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [view, setView] = useState('menu'); // menu, game, dashboard
  const [liveMetrics, setLiveMetrics] = useState({
    stressLevel: 0.5, score: 0, progress: {}, speakingSpeed: 0, energy: 0
  });

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    getPsychologyMetrics
  } = useSpeechRecognition();

  const { voiceMetrics, psychologyData } = useVoiceAnalysis();

  const combinedSpeechData =
    transcript && voiceMetrics
      ? derivePsychologyMetrics(getPsychologyMetrics(), { voiceMetrics, psychologyData })
      : null;


  // ------------ SAVE HISTORY & LIVE AGENT METRICS ------------ //
  const handleHistory = (gameEvent) => {
    // store for dashboard
    if (gameEvent?.event === 'game_completed') {
      setSessionHistory(prev => [
        ...prev,
        {
          date: new Date().toLocaleString(),
          gameType: gameEvent.gameType,
          stats: gameEvent
        }
      ]);
    }
    console.log('gameEvent:', gameEvent);

    // update live “stress“ estimate for the agents
    const perfScore = gameEvent.totalScore || gameEvent.finalScore || 0;
    const speakingRate = combinedSpeechData?.linguistic?.speakingRate || 0;
    const voiceEnergy = combinedSpeechData?.acoustic?.voiceMetrics?.energy || 0;

    setLiveMetrics({
      score: perfScore,
      progress: {
        step: gameEvent.transitionNumber || gameEvent.currentRound || 0,
        totalSteps: gameEvent.totalTransitions || gameEvent.totalRounds || 0,
      },
      speakingSpeed: speakingRate,
      energy: voiceEnergy,
      stressLevel: perfScore < 50 ? 0.75 : perfScore < 300 ? 0.45 : 0.15
    });
  };

  // ------------   MAIN MENU ------------ //
  if (view === 'menu' && !activeGame) {
    return (
      <div className="App">
        <h1>AI-Powered Public Speaking Coach</h1>
        <p className="description">Choose your neural resilience challenge:</p>

        <div className="menu">
          <button onClick={() => { setActiveGame('chaos'); setView('game'); }}>
            Chaos Integration
          </button>
          <button onClick={() => { setActiveGame('energy'); setView('game'); }}>
            Energy Modulator
          </button>
          <button onClick={() => { setActiveGame('rapid'); setView('game'); }}>
            Rapid-Fire Analogies
          </button>
          <div className="diff">
            Difficulty:&nbsp;
            <select value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map(level => (
                <option key={level} value={level}>Level {level}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="privacy-msg">
          Your speech data stays private on this device and is never sent to our servers.
        </p>

        <div className="dashboard-button-wrapper">
          <button className="dashboard-btn" onClick={() => setView('dashboard')}>
            📊 View Past Sessions
          </button>
        </div>
      </div>
    );
  }

  // ------------ DASHBOARD ------------ //
  if (view === 'dashboard') {
    return (
      <div className="App">
        <Dashboard sessionHistory={sessionHistory} />
        <button onClick={() => setView('menu')}>Back to Menu</button>
      </div>
    );
  }

  // ------------ GAME SCREEN (with Agents) ------------ //
  return (
    <div className="App">
      <div className="agents-panel">
        <AgentInterface
          speechData={combinedSpeechData}
          performanceMetrics={{ sessionHistory }}
          onRecommendation={(rec) => console.log('Advisor rec:', rec)}
        />
        <RecoverySpecialistAgent
          speechAnalytics={combinedSpeechData}
          stressMetrics={liveMetrics}  // <— patched here
          onInterventionTrigger={(p) => console.log('Intervention:', p)}
        />
      </div>

      <div className="game-area">
        {activeGame === 'chaos' && (
          <ChaosIntegration
            isActive
            difficulty={difficulty}
            onSpeechData={handleHistory}
            speechRecognition={{ transcript }}
          />
        )}
        {activeGame === 'energy' && (
          <EnergyModulator
            isActive
            difficulty={difficulty}
            onSpeechData={handleHistory}
            voiceAnalytics={{ voiceMetrics, psychologyData }}
          />
        )}
        {activeGame === 'rapid' && (
          <RapidFireAnalogies
            isActive
            difficulty={difficulty}
            onSpeechData={handleHistory}
            speechRecognition={{ transcript }}
          />
        )}
      </div>

      <div className="controls">
        {!isListening ? (
          <button onClick={startListening}>Start Listening 🎙️</button>
        ) : (
          <button onClick={stopListening}>Stop Listening ⏹️</button>
        )}

        <button onClick={() => { setActiveGame(null); setView('menu'); }}>
          Back to Menu ⬅
        </button>
      </div>

      <p className="privacy-msg">
        Your speech data stays private on this device and is never sent to our servers.
      </p>
    </div>
  );
}

export default App;
