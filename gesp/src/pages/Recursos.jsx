import React, { useState, useRef } from "react";
import "./Recursos.css";

function Recursos() {
  const initial = [
    {
      id: 1,
      type: "PDF",
      title: "Funciones de orden superior",
      desc: "Resumen con ejemplos de map, filter y foldr.",
      author: "María L.",
      category: "Funciones",
      level: "Intermedio",
      date: "2026-07-20",
      url: "#"
    },
    {
      id: 2,
      type: "LINK",
      title: "Haskell paso a paso",
      desc: "Curso interactivo con ejercicios básicos y retroalimentación.",
      author: "Carlos M.",
      category: "Teoría",
      level: "Principiante",
      date: "2026-07-18",
      url: "https://example.com/haskell"
    },
    {
      id: 3,
      type: "PDF",
      title: "Recursividad y casos base",
      desc: "Apuntes breves para comprender llamadas recursivas.",
      author: "Ana P.",
      category: "Recursividad",
      level: "Intermedio",
      date: "2026-07-15",
      url: "#"
    }
  ];

  const [resources, setResources] = useState(initial);
  const [mode, setMode] = useState("PDF");
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef(null);
  const [observations, setObservations] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  function handleDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) {
      setFile(f);
    }
  }

  function handleFileChange(e) {
    const f = e.target.files && e.target.files[0];
    if (f) setFile(f);
  }

  function handlePublish() {
    if (mode === "PDF" && !file) return alert("Selecciona un archivo PDF");
    if (mode === "LINK" && !link) return alert("Introduce una URL");
    setShowConfirm(true);
  }

  function confirmPublish(){
    const id = Date.now();
    const newRes = {
      id,
      type: mode === "PDF" ? "PDF" : "LINK",
      title: title || (file ? file.name : "Nuevo recurso"),
      desc: mode === "PDF" ? "Archivo subido por la comunidad." : "Enlace compartido.",
      author: "Tú",
      category: category || "General",
      level: level || "Principiante",
      date: new Date().toISOString().slice(0,10),
      observations: observations,
      url: mode === "PDF" ? URL.createObjectURL(file) : link
    };

    setResources((s) => [newRes, ...s]);
    // limpiar
    setFile(null);
    setLink("");
    setTitle("");
    setCategory("");
    setLevel("");
    setShowConfirm(false);
    setShowSuccess(true);
  }

  const filtered = resources.filter((r) => {
    if (filterType !== "ALL" && r.type !== filterType) return false;
    if (categoryFilter && r.category !== categoryFilter) return false;
    if (levelFilter && r.level !== levelFilter) return false;
    if (search && !(`${r.title} ${r.desc} ${r.author} ${r.category}`.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  // sorting
  const sorted = [...filtered].sort((a,b)=>{
    if(sortOption === 'newest') return new Date(b.date) - new Date(a.date);
    if(sortOption === 'oldest') return new Date(a.date) - new Date(b.date);
    if(sortOption === 'title-asc') return a.title.localeCompare(b.title);
    if(sortOption === 'title-desc') return b.title.localeCompare(a.title);
    return 0;
  });

  return (
    <div className="recursos-page">
      <div className="page-header"><h1>Recursos</h1></div>
      <div className="recursos-grid">
        <div className="recursos-left">
        <h3>Compartir recurso</h3>

        <div className="mode-tabs">
          <button className={mode === "PDF" ? "tab active" : "tab"} onClick={() => setMode("PDF")}>Documento PDF</button>
          <button className={mode === "LINK" ? "tab active" : "tab"} onClick={() => setMode("LINK")}>Enlace externo</button>
        </div>

        {mode === "PDF" ? (
          <>
            <div className="dropzone" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileInputRef.current.click()}>
              <div className="drop-inner">
                <div className="pdf-icon">PDF</div>
                <div className="drop-text">{file ? file.name : "Arrastra tu archivo aquí o selecciónalo desde tu equipo"}</div>
                <div className="drop-hint">Máximo 10 MB</div>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="application/pdf" style={{display:'none'}} onChange={handleFileChange} />
          </>
        ) : (
          <div className="link-input">
            <input placeholder="https://" value={link} onChange={(e)=>setLink(e.target.value)} />
          </div>
        )}

        <label>Título del recurso</label>
        <input className="text" placeholder="Ej.: Guía de recursividad en Haskell" value={title} onChange={(e)=>setTitle(e.target.value)} />

        <div className="row">
          <div className="col">
            <label>Categoría</label>
            <select value={category} onChange={(e)=>setCategory(e.target.value)}>
              <option value="">Selecciona</option>
              <option>Recursividad</option>
              <option>Funciones</option>
              <option>Teoría</option>
            </select>
          </div>
          <div className="col">
            <label>Nivel recomendado</label>
            <select value={level} onChange={(e)=>setLevel(e.target.value)}>
              <option value="">Selecciona</option>
              <option>Principiante</option>
              <option>Intermedio</option>
              <option>Avanzado</option>
            </select>
          </div>
        </div>

        <label>Observaciones</label>
        <textarea className="text" placeholder="Notas o descripción adicional" value={observations} onChange={(e)=>setObservations(e.target.value)} />

        <div style={{marginTop:12}}>
          <button className="publish-btn" style={{width:'100%'}} onClick={handlePublish}>Publicar material</button>
        </div>

        </div>

        <div className="recursos-right">
        <div className="resources-header">
          <h3>Recursos de la comunidad</h3>
          <div className="badge">{resources.length} recursos compartidos</div>
        </div>

        <div className="controls">
          <div className="controls-left">
            <div className="filters">
              <button className={filterType==='ALL'? 'chip active':'chip'} onClick={()=>setFilterType('ALL')}>Todos</button>
              <button className={filterType==='PDF'? 'chip active':'chip'} onClick={()=>setFilterType('PDF')}>PDF</button>
              <button className={filterType==='LINK'? 'chip active':'chip'} onClick={()=>setFilterType('LINK')}>Enlaces</button>
            </div>

            <select value={categoryFilter} onChange={(e)=>setCategoryFilter(e.target.value)}>
              <option value="">Todas las categorías</option>
              <option>Recursividad</option>
              <option>Funciones</option>
              <option>Teoría</option>
              <option>General</option>
            </select>

            <select value={levelFilter} onChange={(e)=>setLevelFilter(e.target.value)}>
              <option value="">Todos los niveles</option>
              <option>Principiante</option>
              <option>Intermedio</option>
              <option>Avanzado</option>
            </select>
          </div>

          <div className="controls-right">
            <div className="search">
              <input placeholder="Buscar recurso..." value={search} onChange={(e)=>setSearch(e.target.value)} />
            </div>
            <select value={sortOption} onChange={(e)=>setSortOption(e.target.value)}>
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="title-asc">Título A→Z</option>
              <option value="title-desc">Título Z→A</option>
            </select>
          </div>
        </div>

        <div className="resource-list">
          {sorted.map((r)=> (
            <div className="resource-card" key={r.id}>
              <div className="left">
                <div className={r.type==='PDF' ? 'pill pdf' : 'pill link'}>{r.type}</div>
                <div className="meta">
                  <div className="title">{r.title}</div>
                  <div className="desc">{r.desc}</div>
                  <div className="by">{r.category} · {r.level} · Por {r.author} · {r.date}</div>
                </div>
              </div>
              <div className="actions">
                {r.type==='PDF' ? (
                  <button className="outline" onClick={()=> window.open(r.url, '_blank')}>Ver PDF</button>
                ) : (
                  <button className="outline" onClick={()=> window.open(r.url, '_blank')}>Abrir link</button>
                )}
              </div>
            </div>
          ))}
        </div>

        </div>
      </div>
      {showConfirm && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Confirmar publicación</h3>
            <p>¿Deseas publicar este material en la comunidad?</p>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
              <button className="btn" onClick={()=>setShowConfirm(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={confirmPublish}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Material subido correctamente.</h3>
            <div style={{display:'flex',justifyContent:'flex-end',marginTop:12}}>
              <button className="btn" onClick={()=>setShowSuccess(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recursos;
