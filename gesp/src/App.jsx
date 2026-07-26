import Navbar from "./components/Navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Recursos from "./pages/Recursos";
import Progreso from "./pages/Progreso";
import Profile from "./pages/Profile";

function App() {

  return (
    <div style={{ paddingTop: "64px" }}>

      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/recursos" element={<Recursos />} />
        <Route path="/progreso" element={<Progreso />} />
      </Routes>

    </div>
  );
}

export default App;