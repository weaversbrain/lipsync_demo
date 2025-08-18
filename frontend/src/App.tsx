import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ThanosCharacter from "./components/ThanosCharacter";
import MocoCharacter from "./components/MocoCharacter";
import EggniCharacter from "./components/EggniCharacter";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/thanos" replace />} />
        <Route path="/thanos" element={<ThanosCharacter />} />
        <Route path="/moco" element={<MocoCharacter />} />
        <Route path="/eggni" element={<EggniCharacter />} />
      </Routes>
    </Router>
  );
}

export default App;
