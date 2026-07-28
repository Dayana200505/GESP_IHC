import React, { useState, useRef, useEffect } from "react";
import "./Home.css";

function Home({ isAuthenticated, onSaveCorrect }) {
  const initial = `filter even [1..10]`;
  const [code, setCode] = useState(initial);
  const [steps, setSteps] = useState([]);
  const [visible, setVisible] = useState(0);
  const [isExplaining, setIsExplaining] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [canSave, setCanSave] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSaveErrorModal, setShowSaveErrorModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const intervalRef = useRef();

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  function checkSyntax(text) {
    const stack = [];
    const pairs = { ")": "(", "]": "[", "}": "{" };
    for (let ch of text) {
      if (["(", "[", "{"].includes(ch)) stack.push(ch);
      if ([")", "]", "}"].includes(ch)) {
        if (stack.length === 0 || stack.pop() !== pairs[ch]) {
          return { ok: false, msg: "Paréntesis o corchetes sin cerrar correctamente." };
        }
      }
    }
    return stack.length === 0
      ? { ok: true }
      : { ok: false, msg: "Faltan cierres de paréntesis o corchetes." };
  }

  function generateSteps(text) {
    if (text.includes("filter")) {
      return [
        "Identifica la llamada a filter y el predicado usado.",
        "Aplica el predicado a cada elemento de la lista.",
        "Construye una nueva lista con los elementos que cumplen la condición."
      ];
    }

    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) {
      return ["El editor está vacío. Escribe código para obtener una explicación."];
    }

    return lines.map((line, index) => `Paso ${index + 1}: analiza la expresión "${line}" y describe su función.`);
  }

  function handleExplain() {
    clearInterval(intervalRef.current);
    setIsExplaining(true);
    setHasError(false);
    setErrorMsg("");
    setSteps([]);
    setVisible(0);
    setCanSave(false);

    const syntax = checkSyntax(code);
    if (!syntax.ok) {
      setHasError(true);
      setErrorMsg(syntax.msg);
      setSteps([`Error de sintaxis: ${syntax.msg}`]);
      setCanSave(true);
      setIsExplaining(false);
      return;
    }

    const generated = generateSteps(code);
    setSteps(generated);

    let count = 0;
    intervalRef.current = setInterval(() => {
      count += 1;
      setVisible(count);
      if (count >= generated.length) {
        clearInterval(intervalRef.current);
        setIsExplaining(false);
        setCanSave(true);
      }
    }, 450);
  }

  function handleSave() {
    if (hasError) {
      setShowSaveErrorModal(true);
      return;
    }

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setShowSuccessModal(true);
    onSaveCorrect?.();
  }

  function handleSaveDraft() {
    setShowSaveErrorModal(false);
    setShowDraftModal(true);
  }

  const lineCount = code.split("\n").length;

  return (
    <div className="home-container">
      <div className="card editor-card">
        <h2>Editor de código</h2>
        <div className="code-editor">
          <div className="line-numbers">
            {Array.from({ length: lineCount }, (_, index) => (
              <div key={index}>{index + 1}</div>
            ))}
          </div>
          <textarea
            className="code-area"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <div className="editor-actions">
          <button className="primary-btn btn" onClick={handleExplain} disabled={isExplaining}>
            {isExplaining ? "Analizando código..." : "Explicar función"}
          </button>
        </div>
      </div>

      <div className="card explanation-card">
        <h2>Explicación guiada</h2>
        <div className="explanation-body">
          {steps.slice(0, visible).map((step, index) => (
            <div key={index} className={`ex-step ${hasError ? "error" : ""}`}>
              {step}
            </div>
          ))}

          {!steps.length && <div className="help-text">Genera una explicación para ver los pasos de la función.</div>}
        </div>

        <div className="action-row">
          <button className="btn btn-save" disabled={!canSave} onClick={handleSave}>
            Guardar progreso
          </button>
        </div>
      </div>

      {showAuthModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Guarda tu progreso</h3>
            <p>Debes crear una cuenta o iniciar sesión para guardar tu avance.</p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setShowAuthModal(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveErrorModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>¡Se detectaron errores en tu código!</h3>
            <p>El ejercicio no se marcará como completado, pero puedes guardar un borrador.</p>
            <div className="modal-actions split">
              <button className="btn btn-primary" onClick={() => setShowSaveErrorModal(false)}>
                Seguir editando
              </button>
              <button className="btn btn-secondary" onClick={handleSaveDraft}>
                Guardar como borrador
              </button>
            </div>
          </div>
        </div>
      )}

      {showDraftModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>¡Progreso guardado!</h3>
            <p>Tu ejercicio se guardó como borrador para continuar después.</p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setShowDraftModal(false)}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>¡Progreso guardado!</h3>
            <p>Tu progreso se guardó correctamente.</p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setShowSuccessModal(false)}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
