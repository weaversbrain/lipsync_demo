import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ThanosCharacter from "./components/ThanosCharacter";
import PicoCharacter from "./components/PicoCharacter";
import EggniCharacter from "./components/EggniCharacter";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/thanos" replace />} />
        <Route path="/thanos" element={<ThanosCharacter />} />
        <Route path="/pico" element={<PicoCharacter />} />
        <Route path="/eggni" element={<EggniCharacter />} />
      </Routes>
    </Router>
  );
}

export default App;
