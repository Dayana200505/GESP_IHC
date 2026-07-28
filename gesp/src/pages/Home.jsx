import React, { useState, useRef, useEffect } from "react";
import "./Home.css";

const LINE_HEIGHT = 21; // debe coincidir con --line-height en Home.css
const CODE_EDITOR_PADDING_TOP = 16;

function parseRange(str) {
  const rangeMatch = str.match(/\[\s*(-?\d+)\s*\.\.\s*(-?\d+)\s*\]/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    const arr = [];
    for (let i = start; i <= end; i += 1) arr.push(i);
    return arr;
  }
  const listMatch = str.match(/\[\s*(-?\d+(?:\s*,\s*-?\d+)*)\s*\]/);
  if (listMatch) {
    return listMatch[1].split(",").map((n) => parseInt(n.trim(), 10));
  }
  return null;
}

function buildFunctionFromExpr(paramName, body) {
  const safeBody = body.trim().replace(/\)+$/, "");
  if (!/^[\w\s+\-*/%()<>=!.]+$/.test(safeBody)) return null;
  try {
    // eslint-disable-next-line no-new-func
    return new Function(
      paramName,
      `return (${safeBody.replace(/==/g, "===").replace(/\/=/g, "!==")});`
    );
  } catch {
    return null;
  }
}

function buildPredicateFn(predStr) {
  const p = predStr.trim();
  if (p === "even") return (n) => n % 2 === 0;
  if (p === "odd") return (n) => n % 2 !== 0;
  const lambdaMatch = p.match(/^\(?\s*\\\s*(\w+)\s*->\s*(.+?)\)?$/);
  if (lambdaMatch) {
    return buildFunctionFromExpr(lambdaMatch[1], lambdaMatch[2]);
  }
  return null;
}

function explainFilter(line) {
  const fragments = ["filter conserva los elementos de la lista que cumplen una condición."];
  const match = line.match(/filter\s+(\([^)]*\)|\w+)\s+(\[[^\]]*\])/);
  if (match) {
    const [, predStr, listStr] = match;
    if (predStr === "even") fragments.push("even verifica si cada número es par.");
    else if (predStr === "odd") fragments.push("odd verifica si cada número es impar.");
    else fragments.push(`${predStr.replace(/^\(|\)$/g, "")} es la condición que se aplica a cada elemento.`);

    const arr = parseRange(listStr);
    const predFn = buildPredicateFn(predStr);
    if (arr && predFn) {
      try {
        fragments.push(`Resultado: [${arr.filter(predFn).join(",")}].`);
      } catch {
        /* no se pudo evaluar, se omite el resultado */
      }
    }
  }
  return fragments;
}

function explainMap(line) {
  const fragments = ["map aplica una función a cada elemento de la lista, generando una lista nueva del mismo tamaño."];
  const match = line.match(/map\s+(\([^)]*\)|\w+)\s+(\[[^\]]*\])/);
  if (match) {
    const [, fnStr, listStr] = match;
    const lambdaMatch = fnStr.match(/\\\s*(\w+)\s*->\s*(.+)/);
    if (lambdaMatch) {
      fragments.push(`(${fnStr}) toma cada elemento "${lambdaMatch[1]}" y devuelve el resultado de "${lambdaMatch[2].replace(/\)+$/, "")}".`);
    }
    const arr = parseRange(listStr);
    const fn = buildPredicateFn(fnStr);
    if (arr && fn) {
      try {
        fragments.push(`Resultado: [${arr.map(fn).join(",")}].`);
      } catch {
        /* no se pudo evaluar, se omite el resultado */
      }
    }
  }
  return fragments;
}

const LINE_RULES = [
  {
    test: /::/,
    explain: (line) => {
      const [name, typeSig] = line.split("::").map((s) => s.trim());
      return [
        `Esta es la firma de tipos de "${name || "la función"}".`,
        `Indica que recibe y devuelve valores del tipo: ${typeSig || "no especificado"}.`,
      ];
    },
  },
  {
    test: /^\s*\w+\s*\[\]\s*=/,
    explain: (line) => {
      const m = line.match(/^\s*(\w+)\s*\[\]\s*=\s*(.+)$/);
      return [
        `Caso base: cuando la lista está vacía, "${m?.[1] ?? "la función"}" devuelve ${m?.[2] ?? "un valor"} directamente, sin más llamadas recursivas.`,
      ];
    },
  },
  {
    test: /\(\s*\w+\s*:\s*\w+\s*\)/,
    explain: (line) => {
      const m = line.match(/\((\w+)\s*:\s*(\w+)\)/);
      const head = m?.[1] ?? "x";
      const tail = m?.[2] ?? "xs";
      return [
        `Caso recursivo: procesa una lista no vacía separándola en cabeza (${head}) y cola (${tail}).`,
        `El patrón (${head}:${tail}) extrae el primer elemento '${head}' para combinarlo con el resultado de la llamada recursiva sobre ${tail}.`,
      ];
    },
  },
  { test: /\bfilter\b/, explain: explainFilter },
  { test: /\bmap\b/, explain: explainMap },
  {
    test: /\bfoldr\b/,
    explain: () => ["foldr combina los elementos de la lista de derecha a izquierda, aplicando la función a cada elemento junto con el resultado acumulado."],
  },
  {
    test: /\bfoldl\b/,
    explain: () => ["foldl combina los elementos de la lista de izquierda a derecha, acumulando el resultado en cada paso."],
  },
  {
    test: /\[.*\|.*<-.*\]/,
    explain: () => ["Es una lista por comprensión: genera un nuevo valor por cada elemento que cumple la condición indicada."],
  },
  {
    test: /^\s*\|/,
    explain: () => ["Es una guarda: se evalúa esta condición y, si es verdadera, se usa el resultado de esta línea."],
  },
  {
    test: /\bwhere\b/,
    explain: () => ["Define uno o más valores auxiliares que se usan dentro de la función, evitando repetir cálculos."],
  },
  {
    test: /\blet\b.*\bin\b/,
    explain: () => ['Declara un valor temporal con "let" para usarlo en la expresión que sigue después de "in".'],
  },
  {
    test: /\bif\b.*\bthen\b.*\belse\b/,
    explain: () => ["Es una expresión condicional: evalúa la condición y devuelve un resultado u otro según sea verdadera o falsa."],
  },
  {
    test: /\\\s*\w+\s*->/,
    explain: (line) => {
      const m = line.match(/\\\s*(\w+)\s*->\s*(.+)/);
      return [`Es una función anónima (lambda): recibe "${m?.[1] ?? "x"}" y devuelve el resultado de "${(m?.[2] ?? "").replace(/\)+$/, "")}".`];
    },
  },
  {
    test: /\bJust\b|\bNothing\b|\bMaybe\b/,
    explain: () => ["Usa el tipo Maybe: representa un valor que puede existir (Just) o no existir (Nothing), evitando errores al no encontrar un resultado."],
  },
  { test: /\bhead\b/, explain: () => ["head devuelve el primer elemento de la lista."] },
  { test: /\btail\b/, explain: () => ["tail devuelve la lista sin su primer elemento."] },
  { test: /\blength\b/, explain: () => ["length cuenta cuántos elementos tiene la lista."] },
  { test: /\breverse\b/, explain: () => ["reverse invierte el orden de los elementos de la lista."] },
  { test: /\bsum\b/, explain: () => ["sum suma todos los elementos numéricos de la lista."] },
  { test: /\bproduct\b/, explain: () => ["product multiplica todos los elementos numéricos de la lista."] },
  { test: /\belem\b/, explain: () => ["elem verifica si un valor específico está presente dentro de la lista."] },
  { test: /\bzip\b/, explain: () => ["zip combina dos listas en pares, emparejando los elementos según su posición."] },
  { test: /\btake\b/, explain: () => ["take toma los primeros elementos de la lista según la cantidad indicada."] },
  { test: /\bdrop\b/, explain: () => ["drop descarta los primeros elementos de la lista según la cantidad indicada."] },
  { test: /\bconcat\b/, explain: () => ["concat une varias listas en una sola."] },
  { test: /\breplicate\b/, explain: () => ["replicate crea una lista repitiendo un mismo valor una cantidad determinada de veces."] },
];

function explainLine(rawLine) {
  const line = rawLine.trim();
  if (!line) return ["Esta línea está vacía."];
  const rule = LINE_RULES.find((r) => r.test.test(line));
  if (rule) return rule.explain(line);
  return [`Analiza la expresión "${line}" y describe qué realiza dentro del programa.`];
}

function checkSyntax(text) {
  const stack = [];
  const pairs = { ")": "(", "]": "[", "}": "{" };
  for (const ch of text) {
    if (["(", "[", "{"].includes(ch)) stack.push(ch);
    if ([")", "]", "}"].includes(ch)) {
      if (stack.length === 0 || stack.pop() !== pairs[ch]) {
        return { ok: false, msg: "Paréntesis o corchetes sin cerrar correctamente." };
      }
    }
  }
  return stack.length === 0 ? { ok: true } : { ok: false, msg: "Faltan cierres de paréntesis o corchetes." };
}

function generateFullSteps(code) {
  return code
    .split("\n")
    .map((line, idx) => ({ lineNumber: idx + 1, line, fragments: explainLine(line) }))
    .filter((step) => step.line.trim().length > 0);
}

/* ============================================================
   COMPONENTE
   ============================================================ */

const DEFAULT_CODE = `sumList :: [Int] -> Int
sumList [] = 0
sumList (x:xs) = x + sumList xs`;

function Home({ isAuthenticated, onSaveCorrect }) {
  const [code, setCode] = useState(DEFAULT_CODE);

  const [mode, setMode] = useState("idle"); // idle | line | full
  const [selectedLine, setSelectedLine] = useState(null);
  const [lineFragments, setLineFragments] = useState([]);

  const [fullSteps, setFullSteps] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isExplaining, setIsExplaining] = useState(false);

  const [hasError, setHasError] = useState(false);
  const [canSave, setCanSave] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSaveErrorModal, setShowSaveErrorModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const intervalRef = useRef();

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const lines = code.split("\n");

  function resetExplanationState() {
    clearInterval(intervalRef.current);
    setMode("idle");
    setSelectedLine(null);
    setLineFragments([]);
    setFullSteps([]);
    setVisibleCount(0);
    setIsExplaining(false);
    setCanSave(false);
    setHasError(false);
  }

  function handleCodeChange(event) {
    setCode(event.target.value);
    resetExplanationState();
  }

  function handleLineClick(lineNumber) {
    clearInterval(intervalRef.current);
    const text = lines[lineNumber - 1] ?? "";
    setMode("line");
    setSelectedLine(lineNumber);
    setLineFragments(explainLine(text));
    setIsExplaining(false);
  }

  function handleExplainFunction() {
    clearInterval(intervalRef.current);
    setMode("full");
    setSelectedLine(null);
    setHasError(false);
    setCanSave(false);
    setVisibleCount(0);

    const syntax = checkSyntax(code);
    if (!syntax.ok) {
      setHasError(true);
      setFullSteps([{ lineNumber: null, fragments: [`Error detectado: ${syntax.msg}`] }]);
      setVisibleCount(1);
      setCanSave(true);
      return;
    }

    const generated = generateFullSteps(code);
    const stepsToShow = generated.length
      ? generated
      : [{ lineNumber: null, fragments: ["El editor está vacío. Escribe código para obtener una explicación."] }];

    setFullSteps(stepsToShow);
    setIsExplaining(true);

    let count = 0;
    intervalRef.current = setInterval(() => {
      count += 1;
      setVisibleCount(count);
      if (count >= stepsToShow.length) {
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

  return (
    <div className="home-container">
      {/* Columna izquierda: Editor */}
      <div className="card editor-card">
        <h2>Editor de código</h2>

        <div className="code-editor">
          <div className="line-numbers">
            {lines.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`line-number ${selectedLine === idx + 1 ? "active" : ""}`}
                onClick={() => handleLineClick(idx + 1)}
                title={`Explicar línea ${idx + 1}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="code-area-wrapper">
            {selectedLine && (
              <div className="line-highlight" style={{ top: `${(selectedLine - 1) * LINE_HEIGHT + CODE_EDITOR_PADDING_TOP}px` }} />
            )}
            <textarea
              className="code-area"
              value={code}
              onChange={handleCodeChange}
              spellCheck={false}
              rows={Math.max(lines.length, 10)}
            />
          </div>
        </div>

        <p className="editor-hint">Haz clic en el número de una línea para ver su explicación individual.</p>

        <div className="editor-actions">
          <button className="btn btn-primary" onClick={handleExplainFunction} disabled={isExplaining}>
            {isExplaining ? "Analizando código..." : "Explicar función"}
          </button>
        </div>
      </div>

      {/* Columna derecha: Explicación */}
      <div className="card explanation-card">
        <div className="explanation-header">
          <div>
            <h2>Explicación guiada</h2>
            <p className="mode-label">
              {mode === "line" && "Modo: Línea individual"}
              {mode === "full" && "Modo: Explicación completa"}
              {mode === "idle" && "Selecciona una línea o explica toda la función"}
            </p>
          </div>
          {mode === "line" && selectedLine && <span className="line-badge">Línea [{selectedLine}]</span>}
        </div>

        <div className="explanation-body">
          {mode === "idle" && (
            <div className="help-text">Genera una explicación o haz clic en una línea para ver los pasos.</div>
          )}

          {mode === "line" &&
            lineFragments.map((frag, i) => (
              <div key={i} className="ex-step">
                {frag}
              </div>
            ))}

          {mode === "full" &&
            fullSteps.slice(0, visibleCount).map((step, i) => (
              <div key={i} className={`ex-block ${hasError ? "error" : ""}`}>
                {step.lineNumber && <span className="ex-line-tag">Línea {step.lineNumber}</span>}
                {step.fragments.map((f, j) => (
                  <div key={j} className={`ex-step ${hasError ? "error" : ""}`}>
                    {f}
                  </div>
                ))}
              </div>
            ))}
        </div>

        <div className="action-row">
          <button className="btn btn-save" disabled={!canSave} onClick={handleSave}>
            Guardar progreso
          </button>
        </div>
      </div>

      {/* ===== Modales ===== */}
      {showAuthModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <button type="button" className="modal-close" aria-label="Cerrar" onClick={() => setShowAuthModal(false)}>
              ×
            </button>
            <h3>Guarda tu progreso</h3>
            <p>Para guardar tus explicaciones, historial y avances, primero debes crear una cuenta o iniciar sesión.</p>
            <div className="modal-actions">
              <button className="btn btn-primary btn-block" onClick={() => setShowAuthModal(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveErrorModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <button
              type="button"
              className="modal-close"
              aria-label="Cerrar"
              onClick={() => setShowSaveErrorModal(false)}
            >
              ×
            </button>
            <div className="modal-icon modal-icon-error">!</div>
            <h3>¡Se detectaron errores en tu código!</h3>
            <p>Tu código contiene errores que impiden su ejecución. Puedes guardar tu progreso para continuar editando más tarde, pero este ejercicio no se marcará como completado.</p>
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
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <button type="button" className="modal-close" aria-label="Cerrar" onClick={() => setShowDraftModal(false)}>
              ×
            </button>
            <div className="modal-icon modal-icon-success">✓</div>
            <h3>¡Progreso guardado!</h3>
            <p>Tu progreso se guardó correctamente. Podrás continuar editando este ejercicio cuando lo desees.</p>
            <div className="modal-actions">
              <button className="btn btn-primary btn-block" onClick={() => setShowDraftModal(false)}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <button type="button" className="modal-close" aria-label="Cerrar" onClick={() => setShowSuccessModal(false)}>
              ×
            </button>
            <div className="modal-icon modal-icon-success">✓</div>
            <h3>¡Progreso guardado!</h3>
            <p>Tu progreso se guardó correctamente.</p>
            <div className="modal-actions">
              <button className="btn btn-primary btn-block" onClick={() => setShowSuccessModal(false)}>
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