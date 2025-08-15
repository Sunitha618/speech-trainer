// src/components/Dashboard.js
import React from 'react';

const Dashboard = ({ sessionHistory }) => {
  if (!sessionHistory || sessionHistory.length === 0) {
    return (
      <div className="dashboard">
        <h2>Past Sessions</h2>
        <p>No sessions completed yet.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>Past Sessions</h2>
      {sessionHistory.map((s, idx) => (
        <div className="session-card" key={idx}>
          <strong>{s.gameType}</strong> • {s.date}
          <pre>{JSON.stringify(s.stats, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
