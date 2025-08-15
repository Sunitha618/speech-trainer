// ===== FILE: src/hooks/useVoiceAnalysis.js =====
import { useState, useEffect, useRef, useCallback } from 'react';

const useVoiceAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [voiceMetrics, setVoiceMetrics] = useState({
    volume: 0,
    pitch: 0,
    energy: 0,
    stability: 0
  });
  const [psychologyData, setPsychologyData] = useState(null);
  const [error, setError] = useState(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationRef = useRef(null);

  const voiceHistoryRef = useRef([]);
  const baselineRef = useRef(null);

  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        }
      });

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;

      microphone.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;
      dataArrayRef.current = dataArray;

      return true;
    } catch (err) {
      setError(`Microphone access denied: ${err.message}`);
      return false;
    }
  }, []);

  const analyzeVoice = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    analyser.getByteFrequencyData(dataArray);
    const timeData = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(timeData);

    const volume = calculateRMSVolume(timeData);
    const pitch = calculateDominantFrequency(dataArray, audioContextRef.current.sampleRate);
    const energy = calculateEnergyLevel(dataArray);
    const stability = calculateVoiceStability();

    const currentMetrics = { volume, pitch, energy, stability };
    setVoiceMetrics(currentMetrics);

    const timestamp = Date.now();
    voiceHistoryRef.current.push({ ...currentMetrics, timestamp });

    const thirtySecondsAgo = timestamp - 30000;
    voiceHistoryRef.current = voiceHistoryRef.current.filter(d => d.timestamp > thirtySecondsAgo);

    const psychologyAnalysis = analyzePsychologyPatterns(currentMetrics, voiceHistoryRef.current);
    setPsychologyData(psychologyAnalysis);

    if (isAnalyzing) {
      animationRef.current = requestAnimationFrame(analyzeVoice);
    }
  }, [isAnalyzing]);

  const calculateRMSVolume = (timeData) => {
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      const n = (timeData[i] - 128) / 128;
      sum += n * n;
    }
    return Math.sqrt(sum / timeData.length);
  };

  const calculateDominantFrequency = (frequencyData, sampleRate) => {
    let maxIndex = 0;
    let maxValue = 0;

    const minIndex = Math.floor(80 * frequencyData.length / (sampleRate / 2));
    const maxFreqIndex = Math.floor(400 * frequencyData.length / (sampleRate / 2));

    for (let i = minIndex; i < Math.min(maxFreqIndex, frequencyData.length); i++) {
      if (frequencyData[i] > maxValue) {
        maxValue = frequencyData[i];
        maxIndex = i;
      }
    }
    return maxIndex * (sampleRate / 2) / frequencyData.length;
  };

  const calculateEnergyLevel = (frequencyData) => {
    let sum = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      sum += frequencyData[i];
    }
    return (sum / frequencyData.length) / 255;
  };

  const calculateVoiceStability = () => {
    if (voiceHistoryRef.current.length < 10) return 0.5;

    const recent = voiceHistoryRef.current.slice(-10);
    const pitches = recent.map(s => s.pitch);
    const volumes = recent.map(s => s.volume);

    const pitchVar = calculateVariance(pitches);
    const volumeVar = calculateVariance(volumes);

    const pitchStab = Math.max(0, 1 - pitchVar / 100);
    const volumeStab = Math.max(0, 1 - volumeVar);

    return (pitchStab + volumeStab) / 2;
  };

  const calculateVariance = (values) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  };

  const analyzePsychologyPatterns = (current, history) => {
    if (history.length < 5) return null;

    if (!baselineRef.current && history.length >= 20) {
      baselineRef.current = {
        averageVolume: history.reduce((s, h) => s + h.volume, 0) / history.length,
        averagePitch: history.reduce((s, h) => s + h.pitch, 0) / history.length,
        averageEnergy: history.reduce((s, h) => s + h.energy, 0) / history.length,
        averageStability: history.reduce((s, h) => s + h.stability, 0) / history.length
      };
    }

    const base = baselineRef.current;
    if (!base) return null;

    const confidence = {
      volumeConfidence: calculateVolumeConfidence(current.volume, base.averageVolume),
      pitchConfidence: calculatePitchConfidence(current.stability, base.averageStability),
      energyConfidence: calculateEnergyConfidence(current.energy, base.averageEnergy),
      overallConfidence: 0
    };

    confidence.overallConfidence = (
      confidence.volumeConfidence * 0.4 +
      confidence.pitchConfidence * 0.4 +
      confidence.energyConfidence * 0.2
    );

    const stress = {
      voiceStrain: detectVoiceStrain(current, base),
      energyInstability: detectEnergyInstability(history.slice(-10)),
      confidenceDrops: detectConfidenceDrops(history.slice(-5))
    };

    const flowState = {
      isInFlow: detectFlowState(current, base),
      flowDuration: calculateFlowDuration(history),
      arousalLevel: calculateArousalLevel(current, base)
    };

    const antifragility = {
      pressureResponse: analyzePressureResponse(history),
      recoveryPattern: analyzeRecoveryPattern(history),
      strengthProgression: analyzeStrengthProgression(history)
    };

    return {
      confidence,
      stress,
      flowState,
      antifragility,
      timestamp: Date.now()
    };
  };

  // Placeholder helpers — intentionally simplified
  const calculateVolumeConfidence = (now, base) => Math.max(0, 1 - Math.abs(now - base));
  const calculatePitchConfidence = (now, base) => Math.min(1, now / base);
  const calculateEnergyConfidence = (now, base) => Math.max(0, 1 - Math.abs(now - base));

  const detectVoiceStrain = (c, b) => (c.pitch > b.averagePitch * 1.2) && (c.stability < b.averageStability * 0.8);
  const detectEnergyInstability = (samples) => {
    const variance = calculateVariance(samples.map(h => h.energy));
    return variance > 0.1;
  };
  const detectConfidenceDrops = (samples) => {
    for (let i = 1; i < samples.length; i++) {
      if (samples[i].volume < samples[i - 1].volume * 0.7) return true;
    }
    return false;
  };

  const detectFlowState = (c, b) =>
    Math.abs(c.volume - b.averageVolume) < 0.1 &&
    Math.abs(c.energy - b.averageEnergy) < 0.1 &&
    c.stability > b.averageStability * 0.8;

  const calculateFlowDuration = () => 0;
  const calculateArousalLevel = () => 0;
  const analyzePressureResponse = () => null;
  const analyzeRecoveryPattern = () => null;
  const analyzeStrengthProgression = () => null;

  const startAnalysis = useCallback(async () => {
    const ok = await initializeAudio();
    if (!ok) return;
    setIsAnalyzing(true);
    analyzeVoice();
  }, [analyzeVoice, initializeAudio]);

  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  useEffect(
    () => () => {
      stopAnalysis();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    },
    [stopAnalysis]
  );

  return {
    isAnalyzing,
    voiceMetrics,
    psychologyData,
    error,
    startAnalysis,
    stopAnalysis
  };
};

export default useVoiceAnalysis;
