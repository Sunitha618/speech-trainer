// src/components/ui/ProgressTracker.js
import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Brain, Zap, Activity, Target } from 'lucide-react';

const ProgressTracker = ({ sessionHistory, currentMetrics, userProfile }) => {
  const [viewMode, setViewMode] = useState('overview');
  const [timeRange, setTimeRange] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('overall');

  // ————————————————————————————————————————————
  // Data Filtering
  const filteredData = useMemo(() => {
    if (!sessionHistory || sessionHistory.length === 0) return [];
    const now = Date.now();
    const ranges = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      all: Infinity,
    };
    const cutoff = now - ranges[timeRange];
    return sessionHistory
      .filter((s) => s.timestamp >= cutoff)
      .map((s, i) => ({
        session: i + 1,
        date: new Date(s.timestamp).toLocaleDateString(),
        confidence: (s.averageConfidence ?? 0) * 100,
        antifragility: Math.min(100, Math.max(0, (s.antifragilityScore ?? 0) + 50)),
        flowState: (s.flowStateScore ?? 0) * 100,
        stressResilience: Math.max(0, 100 - (s.stressLevel ?? 0) * 100),
        cognitiveSpeed: s.cognitiveSpeed ?? 0,
        accuracy: s.accuracy ?? 0,
        gameType: s.gameType ?? 'unknown',
        duration: s.duration ?? 0,
        score: s.finalScore ?? s.overallScore ?? 0,
        timestamp: s.timestamp,
      }));
  }, [sessionHistory, timeRange]);

  // ————————————————————————————————————————————
  // Max streak
  const calculateMaxStreak = () => {
    if (!filteredData || filteredData.length < 2) return 0;
    let streak = 0;
    let max = 0;
    for (let i = 1; i < filteredData.length; i++) {
      if (filteredData[i].confidence >= filteredData[i - 1].confidence) {
        streak++;
        max = Math.max(max, streak);
      } else {
        streak = 0;
      }
    }
    return max;
  };

  // ————————————————————————————————————————————
  // Trends
  const performanceTrends = useMemo(() => {
    if (filteredData.length < 2) return {};
    const calc = (m) => {
      const vals = filteredData.map((d) => d[m]).filter(Boolean);
      if (vals.length < 2) return 0;
      const first = vals.slice(0, vals.length / 2).reduce((a, b) => a + b, 0) / (vals.length / 2);
      const second = vals.slice(vals.length / 2).reduce((a, b) => a + b, 0) / (vals.length / 2);
      return ((second - first) / first) * 100;
    };
    return {
      confidence: calc('confidence'),
      antifragility: calc('antifragility'),
      flowState: calc('flowState'),
      stressResilience: calc('stressResilience'),
      overall: (calc('confidence') + calc('antifragility') + calc('flowState')) / 3,
    };
  }, [filteredData]);

  // ————————————————————————————————————————————
  // Achievements
  const achievements = useMemo(() => {
    const total = sessionHistory?.length ?? 0;
    const avgConf = filteredData.length ? filteredData.reduce((a, c) => a + c.confidence, 0) / filteredData.length : 0;
    const topScore = Math.max(...filteredData.map((d) => d.score), 0);
    const maxStreak = calculateMaxStreak();
    return [
      {
        id: 'first_session',
        title: 'First Steps',
        description: 'Complete your first training session',
        achieved: total >= 1,
        icon: '🎯'
      },
      {
        id: 'consistent_trainer',
        title: 'Consistent Trainer',
        description: 'Complete 10 training sessions',
        achieved: total >= 10,
        progress: Math.min(100, (total / 10) * 100),
        icon: '🏃'
      },
      {
        id: 'confidence_master',
        title: 'Confidence Master',
        description: 'Maintain 80% average confidence',
        achieved: avgConf >= 80,
        progress: Math.min(100, (avgConf / 80) * 100),
        icon: '💪'
      },
      {
        id: 'streak_warrior',
        title: 'Streak Warrior',
        description: 'Achieve a 5-session improvement streak',
        achieved: maxStreak >= 5,
        progress: Math.min(100, (maxStreak / 5) * 100),
        icon: '🔥'
      },
      {
        id: 'high_performer',
        title: 'High Performer',
        description: 'Score over 500 points in a single session',
        achieved: topScore >= 500,
        progress: Math.min(100, (topScore / 500) * 100),
        icon: '⭐'
      }
    ];
  }, [sessionHistory, filteredData]);

  // ————————————————————————————————————————————
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length)
      return (
        <div className="bg-slate-800 text-white rounded-md p-3 text-xs shadow-lg">
          <p className="mb-1">Session {label}</p>
          {payload.map((e, i) => (
            <p key={i}>{`${e.dataKey}: ${Math.round(e.value)}`}</p>
          ))}
        </div>
      );
    return null;
  };

  // ————————————————————————————————————————————
  // Game distribution
  const gameTypeData = useMemo(() => {
    const counts = {};
    filteredData.forEach((d) => {
      counts[d.gameType] = (counts[d.gameType] || 0) + 1;
    });
    const colors = {
      rapidFireAnalogies: '#ef4444',
      energyModulator: '#3b82f6',
      chaosIntegration: '#8b5cf6',
      unknown: '#6b7280'
    };
    return Object.entries(counts).map(([type, val]) => ({
      name: type.replace(/([A-Z])/g, ' $1').trim(),
      value: val,
      fill: colors[type] || colors.unknown
    }));
  }, [filteredData]);

  // ————————————————————————————————————————————
  // OVERVIEW charts
  const renderOverviewDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Confidence */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-xl text-white">
          <div className="flex justify-between">
            <Brain />
            <span className={`text-xs px-2 rounded-full ${performanceTrends.confidence > 0 ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
              {performanceTrends.confidence > 0 ? '+' : ''}{performanceTrends.confidence?.toFixed(1)}%
            </span>
          </div>
          <div className="text-2xl font-bold">{Math.round((currentMetrics?.confidence ?? 0) * 100)}%</div>
          <div className="text-xs opacity-80">Confidence</div>
        </div>
        {/* Antifragility */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-xl text-white">
          <div className="flex justify-between">
            <Activity />
            <span className={`text-xs px-2 rounded-full ${performanceTrends.antifragility > 0 ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
              {performanceTrends.antifragility?.toFixed(1)}%
            </span>
          </div>
          <div className="text-2xl font-bold">
            {Math.round((currentMetrics?.antifragilityScore ?? 0) + 50)}
          </div>
          <div className="text-xs opacity-80">Antifragility</div>
        </div>
        {/* Flow */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-xl text-white">
          <div className="flex justify-between">
            <Zap />
            <span className={`text-xs px-2 rounded-full ${performanceTrends.flowState > 0 ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
              {performanceTrends.flowState?.toFixed(1)}%
            </span>
          </div>
          <div className="text-2xl font-bold">
            {Math.round((currentMetrics?.flowStateScore ?? 0) * 100)}%
          </div>
          <div className="text-xs opacity-80">Flow State</div>
        </div>
        {/* Total sessions */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-xl text-white">
          <div className="flex justify-between">
            <Target />
            <span className="text-xs px-2 rounded-full bg-blue-500/30">{filteredData.length}</span>
          </div>
          <div className="text-2xl font-bold">{sessionHistory?.length ?? 0}</div>
          <div className="text-xs opacity-80">Total Sessions</div>
        </div>
      </div>

      {/* Main line performance */}
      <div className="bg-white shadow rounded-xl p-6">
        <div className="flex justify-between mb-4">
          <h4 className="font-semibold">Performance Trends</h4>
          <div className="space-x-2">
            {['all','month','week'].map((t)=>(
              <button
                key={t}
                onClick={()=>setTimeRange(t)}
                className={`px-3 py-1 rounded-full text-xs ${timeRange===t?'bg-blue-500 text-white':'bg-slate-200'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        {filteredData.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="session" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line dataKey="confidence" stroke="#3b82f6" />
              <Line dataKey="antifragility" stroke="#10b981" />
              <Line dataKey="flowState" stroke="#8b5cf6" />
              <Line dataKey="stressResilience" stroke="#f59e0b" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-slate-500 p-8">No data</p>
        )}
      </div>

      {/* Pie + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game pie */}
        <div className="bg-white shadow rounded-xl p-6">
          <h4 className="font-semibold mb-4">Training Distribution</h4>
          {gameTypeData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={gameTypeData} dataKey="value" outerRadius={80} label>
                  {gameTypeData.map((d,i)=>(
                    <Cell key={i} fill={d.fill}/>
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-slate-500">No data</p>}
        </div>

        {/* Recent Sessions */}
        <div className="bg-white shadow rounded-xl p-6">
          <h4 className="font-semibold mb-4">Recent Sessions</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredData.slice(-5).reverse().map((s,i)=>(
              <div key={i} className="p-3 bg-slate-100 rounded-lg flex justify-between">
                <div className="flex space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    s.confidence>=80?'bg-green-500':s.confidence>=60?'bg-yellow-500':'bg-red-500'
                  }`}/>
                  <div>
                    <p className="font-medium">{s.gameType.replace(/([A-Z])/g,' $1').trim()}</p>
                    <p className="text-xs text-slate-500">{s.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{s.score}</p>
                  <p className="text-xs">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievement Cards */}
      <div className="bg-white shadow rounded-xl p-6">
        <h4 className="font-semibold mb-4">Achievements</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements.map((a)=>(
            <div key={a.id} className={`p-4 rounded-xl border-2 ${
              a.achieved ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-slate-100 opacity-60'
            }`}>
              <div className="text-3xl mb-2">{a.icon}</div>
              <div className="font-semibold">{a.title}</div>
              <div className="text-xs text-slate-500 mb-2">{a.description}</div>
              {!a.achieved && a.progress && (
                <div className="w-full h-2 bg-slate-200 rounded-full">
                  <div className="h-full bg-green-500 rounded-full" style={{width:`${a.progress}%`}}/>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ————————————————————————————————————————————
  // Detailed metric
  const renderDetailedMetricChart = () => (
    <div className="bg-white shadow rounded-xl p-6">
      <div className="flex justify-between mb-4">
        <h4 className="font-semibold capitalize">{selectedMetric} Trend</h4>
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="text-sm rounded bg-slate-200 px-3 py-2"
        >
          <option value="confidence">Confidence</option>
          <option value="antifragility">Antifragility</option>
          <option value="flowState">Flow State</option>
          <option value="stressResilience">Stress Resilience</option>
          <option value="overall">Overall</option>
        </select>
      </div>
      {filteredData.length ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="session"/>
            <YAxis/>
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={selectedMetric==='overall'?'score':selectedMetric}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{r:4}}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : <p className="text-center text-slate-500 py-16">No data</p>}
    </div>
  );

  // ————————————————————————————————————————————
  // Return
  return (
    <div className="space-y-6">
      <div className="flex space-x-2">
        <button onClick={() => setViewMode('overview')} className={`px-4 py-2 rounded-lg ${viewMode==='overview'?'bg-blue-500 text-white':'bg-slate-200'}`}>Overview</button>
        <button onClick={() => setViewMode('details')} className={`px-4 py-2 rounded-lg ${viewMode==='details'?'bg-blue-500 text-white':'bg-slate-200'}`}>Detailed</button>
      </div>
      {viewMode === 'overview' ? renderOverviewDashboard() : renderDetailedMetricChart()}
    </div>
  );
};

export default ProgressTracker;
