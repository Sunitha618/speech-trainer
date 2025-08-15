/**
 * Merge psychology information sourced from:
 *   1) Speech recognition (transcript-based)  → speechSummary
 *   2) Voice analysis (acoustic signal)       → voiceSummary
 * Then return a clean normalized profile for session storage.
 *
 * Speech summary format expected:
 * {
 *   overallMetrics: {
 *     totalWords, totalHesitations, speakingSpeed(WPM),
 *     hesitationRate, averageConfidence, totalDuration
 *   },
 *   antifragilityData: {
 *     recoveryPatterns: [...],
 *     adaptabilityScore
 *   }
 * }
 *
 * Voice summary format expected:
 * {
 *   volume, pitch, energy, stability,
 *   confidence, stress, flowState, antifragility,
 * }
 */

// Utility rescale 0-1 → 0-100
const toPercent = (v) => Math.max(0, Math.min(100, v * 100));

export const derivePsychologyMetrics = (speechSummary, voiceSummary) => {
  // ========== Textual Speech Analytics ==========
  const {
    totalWords = 0,
    totalHesitations = 0,
    speakingSpeed = 0,
    hesitationRate = 0,
    averageConfidence = 0,
    totalDuration = 0
  } = speechSummary?.overallMetrics || {};

  const {
    adaptabilityScore = 0,
    recoveryPatterns = []
  } = speechSummary?.antifragilityData || {};

  // ========== Voice Signal Analytics ==========
  // (Assumes voiceSummary.confidence/stress/flowState/antifragility are 0-1 ranges)
  const {
    volume = 0,
    pitch = 0,
    energy = 0,
    stability = 0,
    confidence: voiceConf = 0,
    stress: voiceStress = 0,
    flowState: voiceFlow = 0,
    antifragility: voiceAnti = 0
  } = voiceSummary || {};

  // ========== Combine & Normalize ==========
  // Overall confidence = blend of linguistic & acoustic
  const combinedConfidence = Math.min(
    1,
    (averageConfidence + voiceConf) / 2
  );

  // Overall stress index
  const combinedStress = Math.min(1, voiceStress + hesitationRate);

  // Flow index (voice)
  const combinedFlowState = voiceFlow;

  // Antifragility (blend voice + adaptability + recovery)
  const avgRecovery =
    recoveryPatterns.length > 0
      ? recoveryPatterns.reduce((sum, r) => sum + (r.strengthAfterSetback ? 1 : 0), 0) /
        recoveryPatterns.length
      : 0;
  const blendedAntifragility = Math.min(
    1,
    (voiceAnti + adaptabilityScore / 100 + avgRecovery) / 3
  );

  return {
    linguistic: {
      totalWords,
      totalHesitations,
      speakingSpeed,
      hesitationRate,
      averageConfidence
    },
    acoustic: {
      volume,
      pitch,
      energy,
      stability
    },
    combined: {
      confidence: toPercent(combinedConfidence),
      stressLevel: toPercent(combinedStress),
      flowState: toPercent(combinedFlowState),
      antifragilityScore: toPercent(blendedAntifragility)
    },
    recordedAt: Date.now()
  };
};
