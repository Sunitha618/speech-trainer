/**
 * Utility for behavioral/linguistic speech analysis (text-based only).
 * Use this *after* transcript is generated from speech recognition.
 */

const fillerWords = [
  'um', 'uh', 'er', 'ah', 'like', 'you know', 'basically',
  'actually', 'literally', 'so', 'well'
];

export const analyzeSpeechText = (transcript, startTimestamp, endTimestamp) => {
  if (!transcript) transcript = '';
  const cleaned = transcript.trim();

  // ---------- Core counts ----------
  const words = cleaned.split(/\s+/);
  const wordCount = words.length;
  const durationSec = Math.max(1, (endTimestamp - startTimestamp) / 1000);
  const wpm = (wordCount / durationSec) * 60;

  // ---------- Filler/Hesitation words ----------
  const fillersFound = words.filter(w => fillerWords.includes(w.toLowerCase()));
  const hesitationRate = fillersFound.length / Math.max(1, wordCount);

  // ---------- Average sentence length ----------
  const sentences = cleaned.split(/[.!?]+/).filter(Boolean);
  const avgSentenceLength = sentences.length > 0
    ? wordCount / sentences.length
    : 0;

  // ---------- Placeholder sentiment (extend later) ----------
  const sentiment = {
    label: 'neutral',
    score: 0.5
  };

  // ---------- Readability (simple Flesch index) ----------
  const syllableCount = countSyllables(cleaned);
  const flesch = 206.835 - (1.015 * avgSentenceLength) - (84.6 * (syllableCount / Math.max(1, wordCount)));

  return {
    wordCount,
    wordsPerMinute: parseFloat(wpm.toFixed(2)),
    hesitationRate: parseFloat(hesitationRate.toFixed(4)),
    fillerWords: fillersFound,
    averageSentenceLength: parseFloat(avgSentenceLength.toFixed(2)),
    readabilityScore: Math.max(0, Math.min(100, flesch)),
    sentiment
  };
};

// -------------------------------------------------------

function countSyllables(text) {
  // Very basic English syllable estimator
  const wordList = text.toLowerCase().split(/\s+/);
  let count = 0;
  wordList.forEach(word => {
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const syl = word.match(/[aeiouy]{1,2}/g);
    count += syl ? syl.length : 0;
  });
  return count;
}
