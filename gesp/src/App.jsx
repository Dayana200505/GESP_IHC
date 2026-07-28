import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home";
import Recursos from "./pages/Recursos";
import Progreso from "./pages/Progreso";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";

const initialExercises = [
  { id: 1, title: "Primeros pasos con listas", desc: "Usa head, tail y length para analizar una lista.", difficulty: "Fácil", status: "completed", progress: 100, topic: "Listas" },
  { id: 2, title: "Filtrar números pares", desc: "Aplica filter y una función predicado.", difficulty: "Fácil", status: "in-progress", progress: 45, topic: "Listas" },
  { id: 3, title: "Recursividad básica", desc: "Construye una función recursiva paso a paso.", difficulty: "Intermedio", status: "completed", progress: 100, topic: "Recursividad" },
  { id: 4, title: "Map y fold", desc: "Transforma y reduce listas.", difficulty: "Intermedio", status: "not-started", progress: 0, topic: "Funciones" },
  { id: 5, title: "Tipos y firmas", desc: "Comprende las firmas de funciones.", difficulty: "Difícil", status: "not-started", progress: 0, topic: "Tipos" },
  { id: 6, title: "Listas por comprensión", desc: "Genera colecciones con sintaxis declarativa.", difficulty: "Fácil", status: "not-started", progress: 0, topic: "Listas" },
  { id: 7, title: "Patrones y guardas", desc: "Usa patrones y guardas en definiciones de funciones.", difficulty: "Intermedio", status: "not-started", progress: 0, topic: "Funciones" }
];

const initialUser = {
  name: "Daniel Cruz",
  role: "Estudiante · UMSS",
  level: "Nivel Intermedio 3",
  xpPercent: 80,
  xpTotal: "1.280 XP de 1.600 XP",
  xpNext: "320 XP para el siguiente nivel",
  recent: [
    { id: 1, action: "Filtrar números pares", date: "Hoy", state: "Completado" },
    { id: 2, action: "Listas por comprensión", date: "Ayer", state: "85%" },
    { id: 3, action: "Funciones de orden superior", date: "Hace 2 días", state: "70%" }
  ]
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [exercises, setExercises] = useState(initialExercises);
  const [user, setUser] = useState(initialUser);

  function handleLogin() {
    setIsAuthenticated(true);
  }

  function handleRegister(data) {
    if (data?.name) {
      setUser((prev) => ({ ...prev, name: data.name }));
    }
    setIsAuthenticated(true);
  }

  function handleLogout() {
    setIsAuthenticated(false);
  }

  function handleSaveCorrectProgress() {
    setExercises((current) => {
      const nextIndex = current.findIndex((item) => item.status !== "completed");
      if (nextIndex === -1) return current;
      return current.map((item, index) =>
        index === nextIndex ? { ...item, status: "completed", progress: 100 } : item
      );
    });
  }

  return (
    <div style={{ paddingTop: "64px" }}>
      <Navbar
        isAuthenticated={isAuthenticated}
        userName={user.name}
        onLogout={handleLogout}
      />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              isAuthenticated={isAuthenticated}
              onSaveCorrect={handleSaveCorrectProgress}
            />
          }
        />

        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLoginSuccess={handleLogin} />
            )
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Register onRegisterSuccess={handleRegister} />
            )
          }
        />

        <Route
          path="/perfil"
          element={
            isAuthenticated ? (
              <Profile user={user} exercises={exercises} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/recursos"
          element={
            isAuthenticated ? <Recursos /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/progreso"
          element={
            isAuthenticated ? (
              <Progreso exercises={exercises} setExercises={setExercises} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
