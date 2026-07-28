import React, { useState, useMemo, useRef } from "react";
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
  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const [selectedViewer, setSelectedViewer] = useState(null);
  const [sortOption, setSortOption] = useState("newest");
  const fileInputRef = useRef(null);

  const themeOptions = ["Recursividad", "Funciones", "Teoría", "General"];

  function handleDrop(e) {
    e.preventDefault();
    const dropped = e.dataTransfer.files && e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  function handleFileChange(e) {
    const selected = e.target.files && e.target.files[0];
    if (selected) setFile(selected);
  }

  function handlePublish() {
    if (mode === "PDF" && !file) return alert("Selecciona un archivo PDF");
    if (mode === "LINK" && !link.trim()) return alert("Introduce una URL");
    setShowConfirm(true);
  }

  function confirmPublish() {
    const id = Date.now();
    const newResource = {
      id,
      type: mode === "PDF" ? "PDF" : "LINK",
      title: title || (file ? file.name : "Recurso sin título"),
      desc: mode === "PDF" ? "Archivo compartido por la comunidad." : "Enlace compartido por la comunidad.",
      author: "Tú",
      category: category || "General",
      level: level || "Principiante",
      date: new Date().toISOString().slice(0, 10),
      url: mode === "PDF" ? URL.createObjectURL(file) : link
    };

    setResources((current) => [newResource, ...current]);
    setFile(null);
    setLink("");
    setTitle("");
    setCategory("");
    setLevel("");
    setShowConfirm(false);
    setShowSuccess(true);
  }

  function handleSaveDraft() {
    setShowDraftSaved(true);
  }

  function handleViewPDF(resource) {
    setSelectedViewer(resource);
  }

  const filtered = useMemo(() => {
    return resources.filter((item) => {
      if (filterType === "PDF" && item.type !== "PDF") return false;
      if (filterType === "LINK" && item.type !== "LINK") return false;
      if (search && !(`${item.title} ${item.desc} ${item.author}`.toLowerCase().includes(search.toLowerCase()))) return false;
      if (level && item.level !== level) return false;
      return true;
    });
  }, [resources, filterType, search, level]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortOption === "newest") return new Date(b.date) - new Date(a.date);
      if (sortOption === "oldest") return new Date(a.date) - new Date(b.date);
      if (sortOption === "title-asc") return a.title.localeCompare(b.title);
      if (sortOption === "title-desc") return b.title.localeCompare(a.title);
      return 0;
    });
  }, [filtered, sortOption]);

  return (
    <div className="recursos-page">
      <div className="page-header">
        <div>
          <h1>Material de apoyo</h1>
          <div className="subtitle">Comparte documentos y enlaces útiles para aprender Programación Funcional con Haskell.</div>
        </div>
        <span className="count-pill">{resources.length} recursos compartidos</span>
      </div>

      <div className="recursos-grid">
        <div className="recursos-left">
          <h3>Subir nuevo material</h3>

          <div className="mode-tabs">
            <button className={mode === "PDF" ? "tab active" : "tab"} onClick={() => setMode("PDF")}>Documento PDF</button>
            <button className={mode === "LINK" ? "tab active" : "tab"} onClick={() => setMode("LINK")}>Enlace externo</button>
          </div>

          {mode === "PDF" ? (
            <>
              <div className="dropzone" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileInputRef.current.click()}>
                <div className="drop-inner">
                  <div className="pdf-icon">PDF</div>
                  <div>
                    <div className="drop-text">Arrastra tu archivo aquí o selecciónalo desde tu equipo</div>
                    <div className="drop-hint">Máximo 10 MB</div>
                  </div>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleFileChange} />
            </>
          ) : (
            <div className="link-input">
              <input placeholder="https://" value={link} onChange={(e) => setLink(e.target.value)} />
            </div>
          )}

          <label>Título del recurso</label>
          <input className="text" placeholder="Ej.: Guía de recursividad en Haskell" value={title} onChange={(e) => setTitle(e.target.value)} />

          <div className="row">
            <div className="col">
              <label>Categoría</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Selecciona</option>
                {themeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="col">
              <label>Nivel recomendado</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="">Selecciona</option>
                <option>Principiante</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
              </select>
            </div>
          </div>

          <div className="action-row">
            <button type="button" className="publish-btn" onClick={handlePublish}>Publicar material</button>
            <button type="button" className="btn btn-secondary" onClick={handleSaveDraft}>Guardar borrador</button>
          </div>

          <p className="small-note">Al publicar, el recurso será visible para la comunidad.</p>
        </div>

        <div className="recursos-right">
          <div className="resources-header">
            <h3>Recursos de la comunidad</h3>
            <div className="search-group">
              <input placeholder="Buscar recurso..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="controls">
            <div className="filters">
              <button className={filterType === "ALL" ? "chip active" : "chip"} onClick={() => setFilterType("ALL")}>Todos</button>
              <button className={filterType === "PDF" ? "chip active" : "chip"} onClick={() => setFilterType("PDF")}>PDF</button>
              <button className={filterType === "LINK" ? "chip active" : "chip"} onClick={() => setFilterType("LINK")}>Enlaces</button>
            </div>
            <div className="sort-select">
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="title-asc">Título A→Z</option>
                <option value="title-desc">Título Z→A</option>
              </select>
            </div>
          </div>

          <div className="resource-list">
            {sorted.map((item) => (
              <div className="resource-card" key={item.id}>
                <div className="left">
                  <div className={item.type === "PDF" ? "pill pdf" : "pill link"}>{item.type}</div>
                  <div className="meta">
                    <div className="title">{item.title}</div>
                    <div className="desc">{item.desc}</div>
                    <div className="by">{item.category} · {item.level} · Por {item.author} · {item.date}</div>
                  </div>
                </div>
                <div className="actions">
                  {item.type === "PDF" ? (
                    <button className="outline" onClick={() => handleViewPDF(item)}>Ver PDF</button>
                  ) : (
                    <button className="outline" onClick={() => window.open(item.url, "_blank")}>Abrir link</button>
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
            <h3>¿Está seguro de publicar el material?</h3>
            <p>Al aceptar, el recurso se compartirá con la comunidad.</p>
            <div className="modal-actions split">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={confirmPublish}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Material subido correctamente</h3>
            <p>Tu recurso está disponible para la comunidad.</p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setShowSuccess(false)}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

      {showDraftSaved && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Borrador guardado</h3>
            <p>Tu recurso quedó guardado para editarlo más tarde.</p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setShowDraftSaved(false)}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

      {selectedViewer && (
        <div className="modal-backdrop">
          <div className="modal viewer-modal">
            <div className="viewer-header">
              <h3>{selectedViewer.title}</h3>
              <button className="close-viewer" onClick={() => setSelectedViewer(null)}>X</button>
            </div>
            <div className="viewer-toolbar">
              <span>Archivo PDF</span>
              <span>Pagina 1 / 5</span>
            </div>
            <div className="viewer-content">
              <p>Simulación de visor de documento para el recurso seleccionado.</p>
              <p>Contenido ficticio mostrando un resumen del PDF y algunos bloques de texto.</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setSelectedViewer(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recursos;
