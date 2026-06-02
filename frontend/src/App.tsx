import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { Board } from "./components/Board";
import { InviteHandler } from './components/InviteHandler';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/board/:id" element={<Board />} />
        <Route path="/invite/:id" element={<InviteHandler />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;