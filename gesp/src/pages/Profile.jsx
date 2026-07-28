import React from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile({ user, exercises, onLogout }) {
  const navigate = useNavigate();
  const completed = exercises.filter((item) => item.status === "completed").length;
  const total = exercises.length;

  const summary = {
    exercises: completed,
    streak: 7,
    badges: 4,
    accuracy: "82%"
  };

  const recent = user.recent || [];

  const handleLogout = () => {
    onLogout?.();
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1>Mi perfil</h1>
          <div className="subtitle">Consulta tu nivel, logros y actividad reciente.</div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span className="logout-icon">⏻</span> Cerrar sesión
        </button>
      </div>

      <div className="profile-grid">
        <div className="left-col card">
          <div className="avatar-large">{user.name.split(" ").map((item) => item[0]).slice(0, 2).join("")}</div>
          <div className="user-name">{user.name}</div>
          <div className="user-role">{user.role}</div>

          <div className="level-pill">{user.level}</div>
          <div className="xp-total">{user.xpTotal}</div>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${user.xpPercent}%` }}></div>
          </div>
          <div className="xp-text">{user.xpNext}</div>
        </div>

        <div className="right-col">
          <div className="summary-card card">
            <h3>Resumen de aprendizaje</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-num">{summary.exercises}</div>
                <div className="summary-label">Ejercicios</div>
              </div>
              <div className="summary-item">
                <div className="summary-num green">{summary.streak}</div>
                <div className="summary-label">Días seguidos</div>
              </div>
              <div className="summary-item">
                <div className="summary-num">{summary.badges}</div>
                <div className="summary-label">Insignias</div>
              </div>
              <div className="summary-item">
                <div className="summary-num">{summary.accuracy}</div>
                <div className="summary-label">Precisión</div>
              </div>
            </div>
          </div>

          <div className="activity card">
            <h3>Actividad reciente</h3>
            <div className="activity-list">
              {recent.map((item) => (
                <div className="activity-row" key={item.id}>
                  <div className="act-dot" data-state={item.state === "Completado" ? "done" : item.state.endsWith("%") ? "progress" : ""}></div>
                  <div className="act-name">{item.action}</div>
                  <div className="act-status">{item.state}</div>
                  <div className="act-time">{item.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
