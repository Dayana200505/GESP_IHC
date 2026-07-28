import React, { useMemo } from "react";
import "./Progreso.css";

function Progreso({ exercises, setExercises }) {
  const [filter, setFilter] = React.useState("Todos");
  const [topicFilter, setTopicFilter] = React.useState("");

  const total = exercises.length;
  const completedCount = exercises.filter((item) => item.status === "completed").length;
  const overall = Math.round(
    exercises.reduce((sum, item) => sum + item.progress, 0) / (total || 1)
  );

  const themes = ["Listas", "Recursividad", "Funciones", "Tipos"];

  const filteredExercises = useMemo(() => {
    return exercises.filter((item) => {
      if (filter !== "Todos" && item.difficulty !== filter) return false;
      if (topicFilter && item.topic !== topicFilter) return false;
      return true;
    });
  }, [exercises, filter, topicFilter]);

  const handleToggleStatus = (id) => {
    setExercises((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        if (item.status === "completed") return { ...item, status: "not-started", progress: 0 };
        if (item.status === "in-progress") return { ...item, status: "completed", progress: 100 };
        return { ...item, status: "in-progress", progress: 45 };
      })
    );
  };

  return (
    <div className="progreso-page">
      <div className="page-header">
        <div>
          <h1>Mi progreso</h1>
          <div className="subtitle">Ejercicios ordenados de fácil a difícil para dominar Haskell.</div>
        </div>
      </div>

      <div className="overall-card">
        <div className="overall-left">
          <div className="overall-title">Progreso general</div>
          <div className="overall-sub">{completedCount} de {total} ejercicios completados</div>
          <div className="bar">
            <div className="bar-fill" style={{ width: `${overall}%` }}></div>
          </div>
        </div>
        <div className="overall-right">{overall}%</div>
      </div>

      <div className="progreso-grid">
        <aside className="progress-sidebar">
          <div className="sidebar-card">
            <h3>Niveles</h3>
            <div className="sidebar-filter">
              {[
                { label: `Todos (${total})`, value: "Todos" },
                { label: `Fácil (${exercises.filter((item) => item.difficulty === "Fácil").length})`, value: "Fácil" },
                { label: `Intermedio (${exercises.filter((item) => item.difficulty === "Intermedio").length})`, value: "Intermedio" },
                { label: `Difícil (${exercises.filter((item) => item.difficulty === "Difícil").length})`, value: "Difícil" }
              ].map((option) => (
                <button
                  key={option.value}
                  className={`level-chip ${filter === option.value ? "active" : ""}`}
                  onClick={() => setFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-card">
            <h3>Tema</h3>
            <div className="topic-tags">
              {themes.map((topic) => (
                <button
                  key={topic}
                  className={`topic-chip ${topicFilter === topic ? "active" : ""}`}
                  onClick={() => setTopicFilter(topicFilter === topic ? "" : topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="progress-exercises">
          {filteredExercises.map((exercise) => (
            <div className="exercise-card" key={exercise.id}>
              <div className="exercise-main">
                <div className="ex-index">{exercise.id}.</div>
                <div className="ex-body">
                  <div className="ex-title">{exercise.title}</div>
                  <div className="ex-desc">{exercise.desc}</div>
                </div>
              </div>
              <div className="exercise-meta">
                <div className={`difficulty ${exercise.difficulty.toLowerCase()}`}>{exercise.difficulty}</div>
                <div className="topic-tag">{exercise.topic}</div>
                <div className="small-bar">
                  <div className="small-fill" style={{ width: `${exercise.progress}%` }}></div>
                </div>
                <button
                  className={`status ${exercise.status === "completed" ? "done" : exercise.status === "in-progress" ? "progress" : ""}`}
                  onClick={() => handleToggleStatus(exercise.id)}
                >
                  {exercise.status === "completed"
                    ? "Completado"
                    : exercise.status === "in-progress"
                    ? "En progreso"
                    : "Siguiente"}
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Progreso;
