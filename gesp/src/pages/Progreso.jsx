import React, { useState, useMemo } from "react";
import "./Progreso.css";

function Progreso(){
  const exercisesInit = [
    { id:1, title: 'Primeros pasos con listas', desc: 'Usa head, tail y length para analizar una lista.', difficulty: 'Difícil', status: 'completed', progress: 100 },
    { id:2, title: 'Filtrar números pares', desc: 'Aplica filter y una función predicado.', difficulty: 'Fácil', status: 'in-progress', progress: 45 },
    { id:3, title: 'Recursividad básica', desc: 'Construye una función recursiva paso a paso.', difficulty: 'Intermedio', status: 'completed', progress: 100 },
    { id:4, title: 'Map y fold', desc: 'Transforma y reduce listas.', difficulty: 'Intermedio', status: 'not-started', progress: 0 },
    { id:5, title: 'Tipos y firmas', desc: 'Comprende las firmas de funciones.', difficulty: 'Fácil', status: 'not-started', progress: 0 }
  ];

  const [exercises, setExercises] = useState(exercisesInit);
  const [filter, setFilter] = useState('Todos');

  const total = exercises.length;
  const completedCount = exercises.filter(e=>e.status==='completed').length;
  const pendingCount = total - completedCount;
  const overall = Math.round((exercises.reduce((s,e)=>s+e.progress,0) / (total||1)));

  function toggleStatus(id){
    setExercises((arr)=> arr.map(e=> {
      if(e.id!==id) return e;
      if(e.status==='completed') return {...e, status:'not-started', progress:0};
      if(e.status==='in-progress') return {...e, status:'completed', progress:100};
      return {...e, status:'in-progress', progress:50};
    }))
  }

  const filteredExercises = useMemo(()=>{
    if(filter==='Todos') return exercises;
    return exercises.filter(e=> e.difficulty === filter);
  },[exercises, filter]);

  return (
    <div className="progreso-page">
      <div className="page-header"><h1>Mi Progreso</h1></div>

      <div className="summary-cards">
        <div className="card-stat">
          <div className="stat-title">Porcentaje completado</div>
          <div className="stat-value">{overall}%</div>
        </div>
        <div className="card-stat">
          <div className="stat-title">Ejercicios completados</div>
          <div className="stat-value">{completedCount}</div>
        </div>
        <div className="card-stat">
          <div className="stat-title">Ejercicios pendientes</div>
          <div className="stat-value">{pendingCount}</div>
        </div>
        <div className="card-stat">
          <div className="stat-title">Racha</div>
          <div className="stat-value">7 días</div>
        </div>
      </div>

      <div className="overall-card">
        <div className="overall-left">
          <div className="overall-title">Progreso general</div>
          <div className="overall-sub">{completedCount} de {total} ejercicios completados</div>
          <div className="bar">
            <div className="bar-fill" style={{width: `${overall}%`}}></div>
          </div>
        </div>
        <div className="overall-right">{overall}%</div>
      </div>

      <div className="filters-row">
        <div className={`filter-chip ${filter==='Todos' ? 'active' : ''}`} onClick={()=>setFilter('Todos')}>Todos</div>
        <div className={`filter-chip ${filter==='Fácil' ? 'active' : ''}`} onClick={()=>setFilter('Fácil')}>Fácil</div>
        <div className={`filter-chip ${filter==='Intermedio' ? 'active' : ''}`} onClick={()=>setFilter('Intermedio')}>Intermedio</div>
        <div className={`filter-chip ${filter==='Difícil' ? 'active' : ''}`} onClick={()=>setFilter('Difícil')}>Difícil</div>
      </div>

      <div className="exercise-list">
        {filteredExercises.map((ex)=> (
          <div className="exercise-card" key={ex.id}>
            <div className="exercise-main">
              <div className="ex-index">{ex.id}.</div>
              <div className="ex-body">
                <div className="ex-title">{ex.title}</div>
                <div className="ex-desc">{ex.desc}</div>
              </div>
            </div>

            <div className="exercise-meta">
              <div className={`difficulty ${ex.difficulty.toLowerCase()}`}>{ex.difficulty}</div>
              <div className="small-bar">
                <div className="small-fill" style={{width:`${ex.progress}%`}}></div>
              </div>
              <button className={`status ${ex.status==='completed' ? 'done' : ex.status==='in-progress' ? 'progress' : ''}`} onClick={()=> toggleStatus(ex.id)}>
                {ex.status==='completed' ? 'Completado' : ex.status==='in-progress' ? 'En progreso' : 'Siguiente'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Progreso;
