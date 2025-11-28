import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return mode === 'login' ? (
    <Login onToggleMode={toggleMode} />
  ) : (
    <Signup onToggleMode={toggleMode} />
  );
}

export default AuthPage;
