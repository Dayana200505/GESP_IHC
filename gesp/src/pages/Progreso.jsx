import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./Progreso.css";

/**
 * Mi Progreso.
 *
 * Este componente NO guarda ni marca ejercicios como completados —
 * eso ocurre en Home.jsx (editor), a través de onAttempt/onSaveCorrect
 * en App.jsx. Aquí solo se lee y se filtra el estado ya calculado.
 *
 * Props:
 *  - exercises: [{ id, title, desc, difficulty, topic, status, progress }]
 */
function Progreso({ exercises }) {
  const [levelFilter, setLevelFilter] = useState("Todos");
  const [topicFilter, setTopicFilter] = useState("");

  const total = exercises.length;
  const completedCount = exercises.filter((item) => item.status === "completed").length;
  const overall = Math.round(
    exercises.reduce((sum, item) => sum + item.progress, 0) / (total || 1)
  );

  const themes = [...new Set(exercises.map((item) => item.topic))];

  const filteredExercises = useMemo(() => {
    return exercises.filter((item) => {
      if (levelFilter !== "Todos" && item.difficulty !== levelFilter) return false;
      if (topicFilter && item.topic !== topicFilter) return false;
      return true;
    });
  }, [exercises, levelFilter, topicFilter]);

  const levelOptions = [
    { label: "Todos", value: "Todos", count: total },
    { label: "Fácil", value: "Fácil", count: exercises.filter((e) => e.difficulty === "Fácil").length },
    { label: "Intermedio", value: "Intermedio", count: exercises.filter((e) => e.difficulty === "Intermedio").length },
    { label: "Difícil", value: "Difícil", count: exercises.filter((e) => e.difficulty === "Difícil").length },
  ];

  const statusLabel = (status) => {
    if (status === "completed") return "Completado";
    if (status === "in-progress") return "En progreso";
    return "Siguiente";
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
              {levelOptions.map((option) => (
                <button
                  key={option.value}
                  className={`level-chip ${levelFilter === option.value ? "active" : ""}`}
                  onClick={() => setLevelFilter(option.value)}
                >
                  {option.label} ({option.count})
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
            <Link className="exercise-card" key={exercise.id} to="/">
              <div className="exercise-main">
                <div className="ex-index">{exercise.id}.</div>
                <div className="ex-body">
                  <div className="ex-title">{exercise.title}</div>
                  <div className="ex-desc">{exercise.desc}</div>
                  <div className="small-bar">
                    <div className="small-fill" style={{ width: `${exercise.progress}%` }} />
                  </div>
                </div>
              </div>
              <div className="exercise-meta">
                <div className={`difficulty ${exercise.difficulty.toLowerCase()}`}>{exercise.difficulty}</div>
                <div className="topic-tag">{exercise.topic}</div>
                <div className={`status ${exercise.status === "completed" ? "done" : exercise.status === "in-progress" ? "progress" : ""}`}>
                  {statusLabel(exercise.status)}
                </div>
              </div>
            </Link>
          ))}
          {filteredExercises.length === 0 && (
            <div className="empty">No hay ejercicios con estos filtros.</div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Progreso;