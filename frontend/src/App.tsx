import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Board } from './pages/Board';
import { InviteHandler } from './components/InviteHandler';
import { LandingPage } from './pages/landingPage';
import { LoginPage } from './pages/Login';
import { SignupPage } from './pages/Signup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/board/:id" element={<Board />} />
        <Route path="/invite/:id" element={<InviteHandler />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;