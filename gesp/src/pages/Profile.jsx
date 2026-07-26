import React, { useState } from "react";
import "./Profile.css";

function Profile(){
  const [user] = useState({
    name: 'Daniel Cruz',
    role: 'Estudiante · UMSS',
    level: 'Nivel Intermedio 3',
    xpPercent: 80,
    xpTotal: '1.280 XP de 1.600 XP',
    xpNext: '320 XP para el siguiente nivel'
  });

  const [summary] = useState({
    exercises: 18,
    streak: 7,
    badges: 4,
    accuracy: '82%'
  });

  const [recent] = useState([
    { id:1, action: 'Filtrar números pares', date:'Hoy', state:'Completado' },
    { id:2, action: 'Listas por comprensión', date:'Ayer', state:'85%' },
    { id:3, action: 'Funciones de orden superior', date:'Hace 2 días', state:'70%' }
  ]);

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1>Mi perfil</h1>
          <div className="subtitle">Consulta tu nivel, logros y actividad reciente.</div>
        </div>
        <button className="logout-btn">
          <span className="logout-icon">⏻</span> Cerrar sesión
        </button>
      </div>

      <div className="profile-grid">
        <div className="left-col card">
          <div className="avatar-large">DC</div>

          <div className="user-name">{user.name}</div>
          <div className="user-role">{user.role}</div>

          <div className="level-pill">{user.level}</div>
          <div className="xp-total">{user.xpTotal}</div>
          <div className="xp-bar">
            <div className="xp-fill" style={{width: `${user.xpPercent}%`}}></div>
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
              {recent.map(a=> (
                <div className="activity-row" key={a.id}>
                  <div className="act-name">{a.action}</div>
                  <div className={`act-status ${a.state==='Completado' ? 'done' : a.state.endsWith('%') ? 'percent' : ''}`}>{a.state}</div>
                  <div className="act-time">{a.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile;