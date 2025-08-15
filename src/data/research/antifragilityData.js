// src/data/antifragilityData.js
export const antifragilityData = {
  // Stress inoculation protocols for building resilience
  stressInoculationProtocols: {
    beginner: {
      cognitive: [
        {
          name: 'Cognitive Reappraisal',
          description: 'Practice reframing negative thoughts into growth opportunities',
          exercises: [
            'Challenge catastrophic thinking patterns',
            'Find three positive aspects in difficult situations',
            'Reframe "problems" as "challenges" or "opportunities"',
            'Practice perspective-taking from different viewpoints'
          ],
          neuralTargets: ['prefrontal cortex', 'anterior cingulate cortex'],
          duration: 300000, // 5 minutes
          effectiveness: 0.75
        },
        {
          name: 'Uncertainty Training',
          description: 'Build comfort with ambiguous and unpredictable situations',
          exercises: [
            'Practice improvisational speaking without preparation',
            'Embrace "I don\'t know" as a starting point for learning',
            'Set intentionally vague goals and adapt as you progress',
            'Practice decision-making with incomplete information'
          ],
          neuralTargets: ['orbitofrontal cortex', 'insular cortex'],
          duration: 600000, // 10 minutes
          effectiveness: 0.68
        }
      ],
      behavioral: [
        {
          name: 'Progressive Exposure',
          description: 'Gradually increase comfort zone through controlled challenges',
          exercises: [
            'Speak in front of progressively larger audiences',
            'Increase speaking pace by 10% each session',
            'Practice with intentional background noise',
            'Add time pressure to routine tasks'
          ],
          physiologicalMarkers: ['heart rate variability', 'cortisol response'],
          duration: 900000, // 15 minutes
          effectiveness: 0.82
        }
      ]
    },
    intermediate: {
      cognitive: [
        {
          name: 'Paradoxical Thinking',
          description: 'Train the mind to find opportunity within apparent chaos',
          exercises: [
            'Identify how failures led to unexpected benefits',
            'Practice "worst case scenario" planning with positive outcomes',
            'Find competitive advantages in personal weaknesses',
            'Develop "anti-goals" (what not to achieve) for clarity'
          ],
          neuralTargets: ['default mode network', 'dorsolateral prefrontal cortex'],
          duration: 450000, // 7.5 minutes
          effectiveness: 0.79
        },
        {
          name: 'Metacognitive Flexibility',
          description: 'Develop awareness and control over thinking patterns',
          exercises: [
            'Monitor and label cognitive biases in real-time',
            'Practice switching between analytical and creative thinking',
            'Develop multiple mental models for the same situation',
            'Practice "beginner\'s mind" in familiar domains'
          ],
          neuralTargets: ['metacognitive network', 'cognitive control network'],
          duration: 540000, // 9 minutes
          effectiveness: 0.84
        }
      ],
      physiological: [
        {
          name: 'Autonomic Nervous System Training',
          description: 'Build resilience through breath and heart rate variability',
          exercises: [
            'Box breathing under cognitive load (4-4-4-4 pattern)',
            'Heart rate variability biofeedback training',
            'Cold exposure training for stress adaptation',
            'Vagal tone strengthening through humming and singing'
          ],
          biomarkers: ['HRV', 'respiratory sinus arrhythmia', 'vagal tone'],
          duration: 720000, // 12 minutes
          effectiveness: 0.88
        }
      ]
    },
    advanced: {
      cognitive: [
        {
          name: 'Antifragile Mindset Cultivation',
          description: 'Develop systems that gain from disorder and stress',
          exercises: [
            'Design personal systems that improve under pressure',
            'Practice "via negativa" - improvement through subtraction',
            'Develop redundant pathways for critical skills',
            'Cultivate "convex" responses (limited downside, unlimited upside)'
          ],
          neuralTargets: ['executive network', 'salience network'],
          duration: 600000, // 10 minutes
          effectiveness: 0.91
        },
        {
          name: 'Hormetic Stress Application',
          description: 'Apply controlled stress for strengthening rather than damage',
          exercises: [
            'Deliberately seek out constructive criticism',
            'Practice public speaking on controversial topics',
            'Engage in intellectual debates outside comfort zone',
            'Volunteer for high-stakes presentations'
          ],
          neuralTargets: ['stress response network', 'neuroplasticity mechanisms'],
          duration: 1200000, // 20 minutes
          effectiveness: 0.95
        }
      ],
      behavioral: [
        {
          name: 'Optionality Development',
          description: 'Build multiple pathways for success and adaptation',
          exercises: [
            'Develop speaking skills across multiple domains',
            'Practice pivoting mid-presentation based on audience reaction',
            'Build network effects in communication style',
            'Create asymmetric upside opportunities in speech patterns'
          ],
          metrics: ['adaptability score', 'pivot effectiveness', 'audience engagement'],
          duration: 900000, // 15 minutes
          effectiveness: 0.89
        }
      ]
    }
  },

  // Recovery patterns and their effectiveness ratings
  recoveryPatterns: {
    rapid: {
      timeframe: '0-30 seconds',
      characteristics: [
        'Immediate breath regulation',
        'Posture adjustment',
        'Micro-pause utilization',
        'Energy redirection'
      ],
      neuralMechanisms: [
        'Sympathetic nervous system regulation',
        'Prefrontal cortex engagement',
        'Attention allocation shift'
      ],
      trainingSuggestions: [
        'Practice 3-second reset breathing',
        'Develop physical anchor gestures',
        'Train automatic positive self-talk triggers',
        'Build muscle memory for confidence postures'
      ],
      effectiveness: 0.72
    },
    moderate: {
      timeframe: '30 seconds - 2 minutes',
      characteristics: [
        'Cognitive reframing',
        'Strategic pause implementation',
        'Energy level adjustment',
        'Perspective shift'
      ],
      neuralMechanisms: [
        'Cognitive control network activation',
        'Default mode network regulation',
        'Emotional regulation pathways'
      ],
      trainingSuggestions: [
        'Develop go-to reframing phrases',
        'Practice strategic silence utilization',
        'Build repertoire of recovery techniques',
        'Train context-switching abilities'
      ],
      effectiveness: 0.85
    },
    deep: {
      timeframe: '2+ minutes',
      characteristics: [
        'Systematic analysis and adjustment',
        'Comprehensive strategy revision',
        'Deep physiological reset',
        'Paradigm shift integration'
      ],
      neuralMechanisms: [
        'Executive function networks',
        'Metacognitive processing',
        'Long-term memory integration',
        'Neuroplasticity activation'
      ],
      trainingSuggestions: [
        'Develop systematic recovery protocols',
        'Practice comprehensive self-assessment',
        'Build learning integration habits',
        'Train long-term adaptation strategies'
      ],
      effectiveness: 0.93
    }
  },

  // Antifragile response measurement frameworks
  measurementFrameworks: {
    physiological: {
      markers: [
        {
          name: 'Heart Rate Variability',
          description: 'Measure of autonomic nervous system resilience',
          optimalRange: { low: 30, high: 60 },
          measurement: 'RMSSD in milliseconds',
          antifragileIndicator: 'Increased HRV under controlled stress'
        },
        {
          name: 'Cortisol Response Pattern',
          description: 'Hormonal stress adaptation measurement',
          optimalRange: { low: 5, high: 25 },
          measurement: 'μg/dL salivary cortisol',
          antifragileIndicator: 'Faster return to baseline, improved circadian rhythm'
        },
        {
          name: 'Respiratory Rate Variability',
          description: 'Breathing pattern resilience under stress',
          optimalRange: { low: 12, high: 18 },
          measurement: 'Breaths per minute',
          antifragileIndicator: 'Maintained controlled breathing under pressure'
        }
      ]
    },
    cognitive: {
      markers: [
        {
          name: 'Cognitive Flexibility Score',
          description: 'Ability to switch between mental frameworks',
          optimalRange: { low: 70, high: 95 },
          measurement: 'Percentage accuracy on set-shifting tasks',
          antifragileIndicator: 'Improved performance with increased task complexity'
        },
        {
          name: 'Working Memory Under Stress',
          description: 'Cognitive capacity maintenance during pressure',
          optimalRange: { low: 5, high: 9 },
          measurement: 'Digit span length',
          antifragileIndicator: 'Stable or improved capacity under stress'
        },
        {
          name: 'Attention Control',
          description: 'Ability to direct and sustain focus during disruptions',
          optimalRange: { low: 80, high: 98 },
          measurement: 'Percentage accuracy on attention network test',
          antifragileIndicator: 'Enhanced focus with controlled distractions'
        }
      ]
    },
    behavioral: {
      markers: [
        {
          name: 'Speech Fluency Under Pressure',
          description: 'Maintenance of verbal skills during stress',
          optimalRange: { low: 150, high: 200 },
          measurement: 'Words per minute with <5% disfluencies',
          antifragileIndicator: 'Improved articulation clarity under time pressure'
        },
        {
          name: 'Adaptive Response Speed',
          description: 'Time to adjust strategy when conditions change',
          optimalRange: { low: 2, high: 8 },
          measurement: 'Seconds to strategic pivot',
          antifragileIndicator: 'Faster adaptation with increasing unpredictability'
        },
        {
          name: 'Recovery Effectiveness',
          description: 'Ability to bounce back from setbacks',
          optimalRange: { low: 85, high: 98 },
          measurement: 'Percentage return to baseline performance',
          antifragileIndicator: 'Overcompensation beyond original baseline'
        }
      ]
    }
  },

  // Neural pathway strengthening protocols
  neuralStrengtheningProtocols: {
    prefrontalCortex: {
      targetFunctions: ['executive control', 'cognitive flexibility', 'working memory'],
      exercises: [
        {
          name: 'Dual N-Back Training',
          description: 'Simultaneous visual and auditory working memory training',
          protocol: 'Daily 20-minute sessions with progressive difficulty',
          neuroplasticityMechanisms: ['BDNF upregulation', 'dendritic branching'],
          evidenceLevel: 'strong'
        },
        {
          name: 'Cognitive Control Training',
          description: 'Practice inhibiting dominant responses under pressure',
          protocol: 'Go/No-Go tasks with emotional distractors',
          neuroplasticityMechanisms: ['myelin strengthening', 'synaptic efficiency'],
          evidenceLevel: 'moderate'
        }
      ]
    },
    anteriorCingulate: {
      targetFunctions: ['error monitoring', 'conflict resolution', 'attention regulation'],
      exercises: [
        {
          name: 'Mindful Error Awareness',
          description: 'Non-judgmental observation of mistakes during speech',
          protocol: 'Real-time error detection without self-criticism',
          neuroplasticityMechanisms: ['gamma oscillation enhancement', 'top-down control'],
          evidenceLevel: 'strong'
        }
      ]
    },
    insula: {
      targetFunctions: ['interoceptive awareness', 'emotional regulation', 'empathy'],
      exercises: [
        {
          name: 'Bodily Sensation Tracking',
          description: 'Monitoring internal states during speech performance',
          protocol: 'Continuous body scan while maintaining verbal output',
          neuroplasticityMechanisms: ['insular cortex thickening', 'interoceptive accuracy'],
          evidenceLevel: 'moderate'
        }
      ]
    }
  },

  // Antifragile system design principles
  systemDesignPrinciples: {
    redundancy: {
      principle: 'Multiple pathways to achieve the same outcome',
      speechApplications: [
        'Develop multiple communication styles for different audiences',
        'Build backup topic expertise for unexpected questions',
        'Train various energy levels for different presentation contexts',
        'Cultivate multiple forms of audience engagement'
      ],
      implementation: 'Practice same content with 3+ different delivery approaches'
    },
    optionality: {
      principle: 'Preserve multiple choices while limiting downside risk',
      speechApplications: [
        'Prepare modular content that can be rearranged',
        'Develop skills that transfer across domains',
        'Build reputation for adaptability rather than rigid expertise',
        'Create asymmetric opportunities (low cost, high potential upside)'
      ],
      implementation: 'Design presentations with multiple potential endings'
    },
    overcompensation: {
      principle: 'Response that exceeds the original stressor magnitude',
      speechApplications: [
        'Use criticism to fuel deeper expertise development',
        'Convert speaking anxiety into enhanced preparation',
        'Transform interruptions into demonstration of grace under pressure',
        'Leverage technical difficulties to showcase adaptability'
      ],
      implementation: 'Deliberately practice in worse conditions than expected'
    },
    convexity: {
      principle: 'Limited downside exposure with unlimited upside potential',
      speechApplications: [
        'Take calculated speaking risks with managed consequences',
        'Experiment with new techniques in low-stakes environments',
        'Build skills that compound and reinforce each other',
        'Develop signature strengths that differentiate'
      ],
      implementation: 'Regular micro-experiments with protected downside'
    }
  },

  // Performance benchmarks for antifragile development
  performanceBenchmarks: {
    fragile: {
      characteristics: [
        'Performance degrades predictably under stress',
        'Requires optimal conditions to function',
        'Single point of failure vulnerability',
        'Linear relationship between stressor and performance loss'
      ],
      measurements: {
        stressResponseSlope: { min: -2.5, max: -1.5 }, // Negative slope
        recoveryTime: { min: 300, max: 1800 }, // 5-30 minutes
        adaptationRate: { min: 0.1, max: 0.3 } // Low learning from stressors
      }
    },
    robust: {
      characteristics: [
        'Performance remains stable under stress',
        'Maintains function across various conditions',
        'Multiple redundant pathways',
        'Flat relationship between stressor and performance'
      ],
      measurements: {
        stressResponseSlope: { min: -0.2, max: 0.2 }, // Near-zero slope
        recoveryTime: { min: 60, max: 300 }, // 1-5 minutes
        adaptationRate: { min: 0.3, max: 0.6 } // Moderate learning
      }
    },
    antifragile: {
      characteristics: [
        'Performance improves with controlled stress',
        'Thrives in volatile environments',
        'Gains from disorder and challenges',
        'Positive relationship between stressor and long-term performance'
      ],
      measurements: {
        stressResponseSlope: { min: 0.5, max: 2.0 }, // Positive slope
        recoveryTime: { min: 10, max: 60 }, // 10 seconds - 1 minute
        adaptationRate: { min: 0.7, max: 1.0 }, // High learning from stressors
        overcompensationFactor: { min: 1.1, max: 1.5 } // Performance exceeds baseline
      }
    }
  }
};

// Utility functions for antifragility analysis
export const antifragilityUtils = {
  calculateAntifragilityScore: (stressResponse, recoveryTime, adaptationRate) => {
    // Composite score from 0-100
    const stressScore = Math.max(0, Math.min(100, (stressResponse + 2.5) * 20));
    const recoveryScore = Math.max(0, Math.min(100, (1800 - recoveryTime) / 18));
    const adaptationScore = adaptationRate * 100;
    return (stressScore * 0.4 + recoveryScore * 0.3 + adaptationScore * 0.3);
  },

  classifyAntifragilityLevel: (score) => {
    if (score >= 75) return 'antifragile';
    if (score >= 45) return 'robust';
    return 'fragile';
  },

  generateRecommendations: (currentLevel, targetLevel) => {
    const recommendations = [];

    if (currentLevel === targetLevel) {
      recommendations.push('Maintain current training intensity and diversify stress exposure.');
      return recommendations;
    }

    if (currentLevel === 'fragile') {
      recommendations.push('Increase low-intensity stress inoculation exercises (e.g., uncertainty training).');
      recommendations.push('Incorporate progressive exposure protocols to expand comfort zones.');
      recommendations.push('Begin autonomic nervous system training (e.g., box breathing under load).');
    }

    if (currentLevel === 'robust') {
      recommendations.push('Introduce moderate-level hormetic stress challenges (e.g., controlled public speaking pressure).');
      recommendations.push('Practice paradoxical thinking and antifragile mindset exercises.');
      recommendations.push('Deploy system-design principles like optionality and redundancy in speech training.');
    }

    return recommendations;
  }
};
