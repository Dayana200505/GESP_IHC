import React, { useState, useMemo, useRef } from "react";
import "./Recursos.css";

const THEME_OPTIONS = ["Recursividad", "Funciones", "Teoría", "General"];
const LEVEL_OPTIONS = ["Principiante", "Intermedio", "Avanzado"];

const embeddedPDFMetadata = {
  "fold.pdf": {
    title: "Fold en Haskell",
    desc: "Guía práctica sobre fold y su uso en programación funcional.",
    category: "Funciones",
    level: "Intermedio",
    author: "Material oficial",
    date: "2026-07-20",
  },
  "funcionesSobreListas_I_20.pdf": {
    title: "Funciones sobre listas I",
    desc: "Apuntes sobre funciones de listas como map, filter y fold.",
    category: "Funciones",
    level: "Intermedio",
    author: "Material oficial",
    date: "2026-07-18",
  },
  "ListasPorComprensión.pdf": {
    title: "Listas por comprensión",
    desc: "Documentación práctica sobre comprensiones de listas en Haskell.",
    category: "Teoría",
    level: "Principiante",
    author: "Material oficial",
    date: "2026-07-15",
  },
};

const importedPDFs = import.meta.glob("../../materialRecursos/*.pdf", {
  as: "url",
  eager: true,
});

const embeddedResources = Object.entries(importedPDFs).map(([path, url], index) => {
  const fileName = path.split("/").pop();
  const metadata = embeddedPDFMetadata[fileName] || {
    title: fileName.replace(/\.pdf$/i, ""),
    desc: "Documento PDF disponible para consulta.",
    category: "General",
    level: "Intermedio",
    author: "Material oficial",
    date: "2026-07-01",
  };
  return {
    id: 100 + index,
    type: "PDF",
    title: metadata.title,
    desc: metadata.desc,
    author: metadata.author,
    category: metadata.category,
    level: metadata.level,
    date: metadata.date,
    url,
  };
});

const initialResources = [
  ...embeddedResources,
  {
    id: 1,
    type: "LINK",
    title: "Haskell paso a paso",
    desc: "Curso interactivo con ejercicios básicos y retroalimentación.",
    author: "Carlos M.",
    category: "Teoría",
    level: "Principiante",
    date: "2026-07-18",
    url: "https://example.com/haskell",
  },
];

function Recursos() {
  const [resources, setResources] = useState(initialResources);
  const [mode, setMode] = useState("PDF");
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [errors, setErrors] = useState({});

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterLevel, setFilterLevel] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const [selectedViewer, setSelectedViewer] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files && e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      setErrors((prev) => ({ ...prev, file: "" }));
    }
  }
 
  function handleFileChange(e) {
    const selected = e.target.files && e.target.files[0];
    if (selected) {
      setFile(selected);
      setErrors((prev) => ({ ...prev, file: "" }));
    }
  }
 
  function isValidUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }
 
  function validateResource() {
    const nextErrors = {};
 
    if (mode === "PDF") {
      if (!file) {
        nextErrors.file = "Selecciona un archivo PDF.";
      } else if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        nextErrors.file = "El archivo debe ser un PDF.";
      } else if (file.size > 10 * 1024 * 1024) {
        nextErrors.file = "El archivo no puede exceder 10 MB.";
      }
    }
 
    if (mode === "LINK") {
      if (!link.trim()) {
        nextErrors.link = "Introduce una URL.";
      } else if (!isValidUrl(link.trim())) {
        nextErrors.link = "Introduce una URL válida (http(s)://).";
      }
    }
 
    if (!title.trim()) {
      nextErrors.title = "El título del recurso es obligatorio.";
    }
 
    if (!category) {
      nextErrors.category = "Selecciona una categoría.";
    }
 
    if (!level) {
      nextErrors.level = "Selecciona un nivel recomendado.";
    }
 
    return nextErrors;
  }
 
  function handlePublish() {
    const validationErrors = validateResource();
    setErrors(validationErrors);
 
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
 
    setShowConfirm(true);
  }

  function confirmPublish() {
    const id = Date.now();
    const newResource = {
      id,
      type: mode === "PDF" ? "PDF" : "LINK",
      title: title || (file ? file.name : "Recurso sin título"),
      desc:
        mode === "PDF"
          ? "Archivo compartido por la comunidad."
          : "Enlace compartido por la comunidad.",
      author: "Tú",
      category: category || "General",
      level: level || "Principiante",
      date: new Date().toISOString().slice(0, 10),
      url: mode === "PDF" ? URL.createObjectURL(file) : link,
    };

    setResources((current) => [newResource, ...current]);
    setFile(null);
    setLink("");
    setTitle("");
    setCategory("");
    setLevel("");
    setErrors({});
    setSearch(title.trim() || (file ? file.name : ""));
    setFilterType(mode === "PDF" ? "PDF" : "LINK");
    setFilterLevel("");
    setShowConfirm(false);
    setShowSuccess(true);

    window.setTimeout(() => {
      document.getElementById("community-resources")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      searchInputRef.current?.focus();
    }, 120);
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
      if (filterLevel && item.level !== filterLevel) return false;
      if (
        search &&
        !`${item.title} ${item.desc} ${item.author}`.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [resources, filterType, filterLevel, search]);

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
          <p className="subtitle">
            Comparte documentos y enlaces útiles para aprender Programación Funcional con Haskell.
          </p>
        </div>
        <span className="count-pill">{resources.length} recursos compartidos</span>
      </div>

      <div className="recursos-grid">
        {/* ===== Columna izquierda: subir material ===== */}
        <div className="card recursos-left">
          <h3>Subir nuevo material</h3>
          <p className="left-hint">Selecciona el tipo de recurso que deseas compartir.</p>

          <div className="mode-tabs">
            <button
              type="button"
              className={mode === "PDF" ? "tab active" : "tab"}
              onClick={() => {
                setMode("PDF");
                setErrors({});
              }}
            >
              Documento PDF
            </button>
            <button
              type="button"
              className={mode === "LINK" ? "tab active" : "tab"}
              onClick={() => {
                setMode("LINK");
                setErrors({});
              }}
            >
              Enlace externo
            </button>
          </div>

          {mode === "PDF" ? (
            <>
              <div
                className={`dropzone ${isDragging ? "dragging" : ""}`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current.click()}
                role="button"
                tabIndex={0}
              >
                <div className="drop-inner">
                  <div className="pdf-icon">PDF</div>
                  <div>
                    <div className="drop-text">
                      {file ? file.name : "Arrastra tu archivo aquí o selecciónalo desde tu equipo"}
                    </div>
                    <div className="drop-hint">Máximo 10 MB</div>
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            {errors.file && <small className="field-error">{errors.file}</small>}
          </>
          ) : (
          <div className="link-input">
            <input
              placeholder="https://"
              value={link}
              onChange={(e) => {
                  setLink(e.target.value);
                  setErrors((prev) => ({ ...prev, link: "" }));
              }}
            />
            {errors.link && <small className="field-error">{errors.link}</small>}
          </div>
          )}
 
          <label className={errors.title ? "field field-invalid" : "field"}>
            <span className="field-label-text">
              Título del recurso
              <span className="required-mark" aria-hidden="true">*</span>
            </span>
            <input
              className="text-input"
              placeholder="Ej.: Guía de recursividad en Haskell"
              value={title}
              onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((prev) => ({ ...prev, title: "" }));
              }}
            />
            {errors.title && <small className="field-error">{errors.title}</small>}
          </label>
          <div className="row">
            <div className="col">
              <label className={errors.category ? "field field-invalid" : "field"}>
                <span className="field-label-text">
                  Categoría
                  <span className="required-mark" aria-hidden="true">*</span>
                </span>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setErrors((prev) => ({ ...prev, category: "" }));
                  }}
                >
                  <option value="">Selecciona</option>
                  {THEME_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.category && <small className="field-error">{errors.category}</small>}
              </label>
            </div>
            <div className="col">
              <label className={errors.level ? "field field-invalid" : "field"}>
                <span className="field-label-text">
                  Nivel recomendado
                  <span className="required-mark" aria-hidden="true">*</span>
                </span>
                <select
                  value={level}
                  onChange={(e) => {
                    setLevel(e.target.value);
                    setErrors((prev) => ({ ...prev, level: "" }));
                  }}
                >
                  <option value="">Selecciona</option>
                  {LEVEL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.level && <small className="field-error">{errors.level}</small>}
              </label>
            </div>
          </div>

          <div className="action-row">
            <button type="button" className="btn btn-primary" onClick={handlePublish}>
              Publicar material
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleSaveDraft}>
              Guardar borrador
            </button>
          </div>

          <p className="small-note">Al publicar, el recurso será visible para la comunidad.</p>
        </div>

        {/* ===== Columna derecha: recursos de la comunidad ===== */}
        <div id="community-resources" className="card recursos-right">
          <div className="resources-header">
            <h3>Recursos de la comunidad</h3>
            <div className="search-group">
              <input
                ref={searchInputRef}
                placeholder="Buscar recurso..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="search-icon" aria-hidden="true">
                🔍
              </span>
            </div>
          </div>

          <div className="controls">
            <div className="filters">
              <button
                type="button"
                className={filterType === "ALL" ? "chip active" : "chip"}
                onClick={() => setFilterType("ALL")}
              >
                Todos
              </button>
              <button
                type="button"
                className={filterType === "PDF" ? "chip active" : "chip"}
                onClick={() => setFilterType("PDF")}
              >
                PDF
              </button>
              <button
                type="button"
                className={filterType === "LINK" ? "chip active" : "chip"}
                onClick={() => setFilterType("LINK")}
              >
                Enlaces
              </button>
              <button
                type="button"
                className={filterLevel === "Principiante" ? "chip active" : "chip"}
                onClick={() =>
                  setFilterLevel(filterLevel === "Principiante" ? "" : "Principiante")
                }
              >
                Principiante
              </button>
              <button
                type="button"
                className={filterLevel === "Intermedio" ? "chip active" : "chip"}
                onClick={() => setFilterLevel(filterLevel === "Intermedio" ? "" : "Intermedio")}
              >
                Intermedio
              </button>
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
            {sorted.length === 0 && (
              <div className="empty-state">No se encontraron recursos con estos filtros.</div>
            )}

            {sorted.map((item) => (
              <div className="resource-card" key={item.id}>
                <div className="left">
                  <div className={item.type === "PDF" ? "pill pdf" : "pill link"}>{item.type}</div>
                  <div className="meta">
                    <div className="title">{item.title}</div>
                    <div className="desc">{item.desc}</div>
                    <div className="by">
                      {item.category} · {item.level} · Por {item.author} · {item.date}
                    </div>
                  </div>
                </div>
                <div className="actions">
                  {item.type === "PDF" ? (
                    <button type="button" className="btn btn-outline" onClick={() => handleViewPDF(item)}>
                      Ver PDF
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
                    >
                      Abrir link
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Modales ===== */}
      {showConfirm && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h3>¿Está seguro de publicar el material?</h3>
            <p>Al aceptar, el recurso se compartirá con la comunidad.</p>
            <div className="modal-actions split">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={confirmPublish}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <button
              type="button"
              className="modal-close"
              aria-label="Cerrar"
              onClick={() => setShowSuccess(false)}
            >
              ×
            </button>
            <div className="modal-icon modal-icon-success">✓</div>
            <h3>Material subido correctamente</h3>
            <p>Tu recurso está disponible para la comunidad.</p>
            <div className="modal-actions">
              <button className="btn btn-primary btn-block" onClick={() => setShowSuccess(false)}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDraftSaved && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <button
              type="button"
              className="modal-close"
              aria-label="Cerrar"
              onClick={() => setShowDraftSaved(false)}
            >
              ×
            </button>
            <div className="modal-icon modal-icon-success">✓</div>
            <h3>Borrador guardado</h3>
            <p>Tu recurso quedó guardado para editarlo más tarde.</p>
            <div className="modal-actions">
              <button className="btn btn-primary btn-block" onClick={() => setShowDraftSaved(false)}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Visor de PDF ===== */}
      {selectedViewer && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal viewer-modal">
            <div className="viewer-header">
              <h3>{selectedViewer.title}</h3>
              <button
                type="button"
                className="close-viewer"
                aria-label="Cerrar visor"
                onClick={() => setSelectedViewer(null)}
              >
                ×
              </button>
            </div>

            <div className="viewer-toolbar">
              <span>Archivo PDF</span>
              <span>{selectedViewer.author}</span>
            </div>

            <div className="viewer-content">
              {selectedViewer.url ? (
                <iframe
                  src={selectedViewer.url}
                  title={selectedViewer.title}
                  className="viewer-frame"
                />
              ) : (
                <div className="viewer-placeholder">
                  <p>Este es un documento de ejemplo del prototipo.</p>
                  <p>Sube tu propio archivo PDF para visualizarlo aquí directamente.</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary btn-block" onClick={() => setSelectedViewer(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recursos;