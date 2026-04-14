import React, { useState } from 'react';
import { db } from './db';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Predictor from './pages/Predictor';
import Results from './pages/Results';

export default function App() {

  // 🔐 Persist login
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user"));
  });

  const [page, setPage] = useState('landing');
  const [results, setResults] = useState(null);

  // 🧠 Handle prediction
  const handleResults = (data) => {
    setResults(data);
    setPage('results');
  };

  // 🔐 LOGIN SCREEN
  if (!user) {
    return (
      <Login
        onLogin={(u) => {
          localStorage.setItem("user", JSON.stringify(u)); // save login
          setUser(u);
        }}
      />
    );
  }

  // 🏠 LANDING
  if (page === 'landing') {
    return (
      <Landing
        user={user}
        onStart={() => setPage('predictor')}
        onProfile={() => setPage('profile')}
      />
    );
  }

  // 🧠 PREDICTOR
  if (page === 'predictor') {
    return (
      <Predictor
        onResults={handleResults}
        onBack={() => setPage('landing')}
        user={user} // pass user for personalized predictions
      />
    );
  }

  // 📊 RESULTS
  if (page === 'results') {
    return (
      <Results
        data={results}
        user={user} // pass user for report generation
        onReset={() => setPage('predictor')}
        onBack={() => setPage('predictor')}
        onHome={() => setPage('landing')} // optional home
      />
    );
  }

  // 👤 PROFILE
  if (page === 'profile') {
    return (
      <Profile
        user={user}
        onBack={() => setPage('landing')}
        onLogout={() => {
          localStorage.removeItem("user");
          setUser(null);
        }}
      />
    );
  }

  return null;
}
