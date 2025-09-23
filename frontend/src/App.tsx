import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ThanosCharacter from "./components/ThanosCharacter";
import PicoCharacter from "./components/PicoCharacter";
import PicoV2Character from "./components/PicoV2Character";
import EggniCharacter from "./components/EggniCharacter";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/pico-v2" replace />} />
        <Route path="/thanos" element={<ThanosCharacter />} />
        <Route path="/pico" element={<PicoCharacter />} />
        <Route path="/pico-v2" element={<PicoV2Character />} />
        <Route path="/eggni" element={<EggniCharacter />} />
      </Routes>
    </Router>
  );
}

export default App;
