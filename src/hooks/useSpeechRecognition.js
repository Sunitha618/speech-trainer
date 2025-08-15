// ===== FILE: src/hooks/useSpeechRecognition.js =====
import { useState, useEffect, useRef, useCallback } from 'react';

/* -------------------------------------------------------------------------- */
/*                             🎙️ CUSTOM HOOK                                 */
/* -------------------------------------------------------------------------- */
const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef   = useRef(null);
  const timeoutRef       = useRef(null);
  const speechDataRef    = useRef({
    totalWords: 0,
    hesitations: [],
    speakingSpeed: 0,
    pauseDurations: [],
    confidenceLevels: [],
    timestamps: []
  });

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        console.log('Speech recognition started');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimText = '';
        let totalConfidence = 0;
        let confidenceCount = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptPart = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcriptPart + ' ';
            totalConfidence += result[0].confidence || 0.5;
            confidenceCount++;

            speechDataRef.current.timestamps.push(Date.now());
            speechDataRef.current.confidenceLevels.push(result[0].confidence || 0.5);
            speechDataRef.current.totalWords += transcriptPart.trim().split(/\s+/).length;

            const hesitationPattern = /\b(um|uh|er|ah|like|you know)\b/gi;
            const hesitations = transcriptPart.match(hesitationPattern) || [];
            speechDataRef.current.hesitations.push(...hesitations.map(h => ({
              word: h,
              timestamp: Date.now(),
              confidence: result[0].confidence || 0.5
            })));

          } else {
            interimText += transcriptPart;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          if (confidenceCount > 0) {
            setConfidence(totalConfidence / confidenceCount);
          }
        }

        setInterimTranscript(interimText);
        resetTimeout();
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Recognition error: ${event.error}`);
        if (event.error === 'no-speech') {
          resetTimeout();
        } else {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (timeoutRef.current) { clearTimeout(timeoutRef.current); }
      };

    } else {
      setIsSupported(false);
      setError('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            if (recognitionRef.current && isListening) {
              recognitionRef.current.start();
            }
          }, 100);
        } catch (err) {
          console.warn('Error restarting recognition:', err);
        }
      }
    }, 3000);
  };

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition not supported');
      return false;
    }
    if (recognitionRef.current && !isListening) {
      try {
        speechDataRef.current = {
          totalWords: 0,
          hesitations: [],
          speakingSpeed: 0,
          pauseDurations: [],
          confidenceLevels: [],
          timestamps: []
        };
        recognitionRef.current.start();
        return true;
      } catch (err) {
        console.error('Error starting recognition:', err);
        setError('Failed to start speech recognition');
        return false;
      }
    }
    return false;
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setConfidence(0);
    setError(null);
    speechDataRef.current = {
      totalWords: 0,
      hesitations: [],
      speakingSpeed: 0,
      pauseDurations: [],
      confidenceLevels: [],
      timestamps: []
    };
  }, []);

  const getPsychologyMetrics = useCallback(() => {
    const data = speechDataRef.current;
    const duration = data.timestamps.length > 0
      ? (Date.now() - data.timestamps[0]) / 1000
      : 1;
    const speakingSpeed = data.totalWords / (duration / 60);
    const hesitationRate = data.hesitations.length / data.totalWords;
    const avgConfidence = data.confidenceLevels.reduce((sum, c) => sum + c, 0) / data.confidenceLevels.length || 0;

    return {
      overallMetrics: {
        totalWords: data.totalWords,
        totalHesitations: data.hesitations.length,
        speakingSpeed,
        hesitationRate,
        averageConfidence: avgConfidence,
        totalDuration: duration * 1000
      },
      antifragilityData: {
        recoveryPatterns: data.hesitations.map((h, index) => {
          const nextWords = data.timestamps.slice(index + 1, index + 6);
          const recoverySpeed = nextWords.length > 0
            ? nextWords[0] - h.timestamp
            : 1000;
          return {
            hesitationType: h.word,
            recoverySpeed,
            strengthAfterSetback: data.confidenceLevels[index + 1] > h.confidence
          };
        }),
        adaptabilityScore: Math.min(100, (avgConfidence * 100) - (hesitationRate * 50))
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    confidence,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    getPsychologyMetrics
  };
};

/* -------------------------------------------------------------------------- */
/*                    🧠 COMPONENT WHICH USES THIS HOOK                        */
/* -------------------------------------------------------------------------- */
export const SpeechRecorder = () => {
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    getPsychologyMetrics
  } = useSpeechRecognition();

  const handleStop = () => {
    stopListening();
    const metrics = getPsychologyMetrics();
    console.log('SUMMARY METRICS: ', metrics);
    alert(JSON.stringify(metrics, null, 2));
  };

  return (
    <div style={{padding:"1rem",border:"1px solid #ddd",borderRadius:"10px"}}>
      <h3>Speech Recognition Demo</h3>
      <button onClick={startListening} disabled={isListening}>Start</button>
      <button onClick={handleStop} disabled={!isListening}>Stop & Metrics</button>
      <button onClick={resetTranscript}>Reset</button>
      <p><strong>Live transcript:</strong> {transcript}<span style={{opacity:0.4}}>{interimTranscript}</span></p>
      <p><strong>Status:</strong> {isListening ? 'Listening...' : 'Stopped'}</p>
    </div>
  );
};

export default useSpeechRecognition;
