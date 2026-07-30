import { useState, useRef, useEffect } from "react";
import "./Home.css";

const LINE_HEIGHT = 21; // debe coincidir con --line-height en Home.css
const CODE_EDITOR_PADDING_TOP = 15;

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

/* ============================================================
   VALIDACIÓN DE SINTAXIS
   ============================================================ */

function checkBrackets(text) {
  const stack = [];
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const openers = ["(", "[", "{"];
  const closers = [")", "]", "}"];
  let line = 1;

  for (const ch of text) {
    if (ch === "\n") line += 1;
    if (openers.includes(ch)) stack.push({ ch, line });
    if (closers.includes(ch)) {
      const last = stack.pop();
      if (!last || last.ch !== pairs[ch]) {
        return {
          line,
          kind: "bracket",
          message: `Símbolo "${ch}" sin su apertura correspondiente.`,
          suggestion: "Revisa el orden de apertura y cierre de paréntesis, corchetes o llaves y agrega el símbolo que falta.",
        };
      }
    }
  }
  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1];
    return {
      line: unclosed.line,
      kind: "bracket",
      message: `Falta cerrar "${unclosed.ch}" abierto en esta línea.`,
      suggestion: "Cierra el símbolo que abriste para que el bloque quede bien definido.",
    };
  }
  return null;
}

function checkQuotes(text) {
  const errors = [];
  text.split("\n").forEach((line, idx) => {
    const quotes = (line.match(/"/g) || []).length;
    if (quotes % 2 !== 0) {
      errors.push({
        line: idx + 1,
        kind: "quotes",
        message: "Hay comillas dobles sin cerrar en esta línea.",
        suggestion: "Agrega la comilla faltante al final de la cadena o corrige el texto que intentas escribir.",
      });
    }
  });
  return errors;
}

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

function checkKeywordPairs(text) {
  const errors = [];
  const ifC = countMatches(text, /\bif\b/g);
  const thenC = countMatches(text, /\bthen\b/g);
  const elseC = countMatches(text, /\belse\b/g);
  if (ifC !== thenC || thenC !== elseC) {
    errors.push({
      line: 1,
      kind: "keywords",
      message: 'Las palabras "if", "then" y "else" no están balanceadas.',
      suggestion: 'Revisa que cada condición tenga su parte verdadera y falsa correctamente definida.',
    });
  }

  const letC = countMatches(text, /\blet\b/g);
  const inC = countMatches(text, /\bin\b/g);
  if (letC !== inC) {
    errors.push({
      line: 1,
      kind: "keywords",
      message: 'Cada "let" debe tener su "in" correspondiente.',
      suggestion: 'Cierra la expresión auxiliar con la palabra clave "in" cuando ya no la necesites en el contexto actual.',
    });
  }

  const caseC = countMatches(text, /\bcase\b/g);
  const ofC = countMatches(text, /\bof\b/g);
  if (caseC !== ofC) {
    errors.push({
      line: 1,
      kind: "keywords",
      message: 'Cada "case" debe tener su "of" correspondiente.',
      suggestion: 'Completa la estructura de selección agregando la parte correspondiente a "of".',
    });
  }

  return errors;
}

function checkLineSemantics(text) {
  const errors = [];

  text.split("\n").forEach((raw, idx) => {
    const line = raw.trim();
    const n = idx + 1;
    if (!line || line.startsWith("--")) return;

    if (/::\s*$/.test(line)) {
      errors.push({
        line: n,
        kind: "type",
        message: 'Falta indicar el tipo después de "::".',
        suggestion: 'Escribe el tipo que debe devolver la función, por ejemplo: "sumList :: [Int] -> Int".',
      });
    }

    if (/(?<!=)=\s*$/.test(line)) {
      errors.push({
        line: n,
        kind: "expression",
        message: 'Falta una expresión después del "=".',
        suggestion: 'Añade el valor o la operación que debe devolver esa línea.',
      });
    }

    if (/^\|/.test(line) && !/=/.test(line)) {
      errors.push({
        line: n,
        kind: "guard",
        message: 'Falta "=" en la guarda de la línea.',
        suggestion: 'Completa la guarda con una expresión como "| x > 0 = ...".',
      });
    }

    if (/\\\s*\w+/.test(line) && !/->/.test(line)) {
      errors.push({
        line: n,
        kind: "lambda",
        message: 'Falta "->" en la función anónima.',
        suggestion: 'Usa una forma como "\\x -> x + 1" para definir bien la función lambda.',
      });
    }

    if (/,\s*\]/.test(line)) {
      errors.push({
        line: n,
        kind: "syntax",
        message: 'Hay una coma sobrante antes de "]".',
        suggestion: 'Elimina la coma extra para dejar la lista correctamente escrita.',
      });
    }

    if (/=>/.test(line) && !/::/.test(line)) {
      errors.push({
        line: n,
        kind: "syntax",
        message: 'Se encontró "=>" fuera de una restricción de tipo.',
        suggestion: 'Probablemente quisiste usar "->" en esa expresión.',
      });
    }

    if (/[+\-*/%<>]\s*$/.test(line)) {
      errors.push({
        line: n,
        kind: "operator",
        message: 'La línea termina con un operador incompleto.',
        suggestion: 'Completa la operación agregando el valor o la expresión que sigue al operador.',
      });
    }
  });

  return errors;
}

function checkSyntax(text) {
  const errors = [];

  const bracketError = checkBrackets(text);
  if (bracketError) errors.push(bracketError);

  errors.push(...checkQuotes(text));
  errors.push(...checkKeywordPairs(text));
  errors.push(...checkLineSemantics(text));

  return { ok: errors.length === 0, errors };
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

/**
 * Home / Editor de código.
 *
 * Props nuevas (opcionales, no rompen el uso original):
 *  - exercise: { id, title, difficulty, code } — si se pasa, precarga el editor
 *              con ese código y muestra un encabezado "Resolviendo: ...".
 *  - onBack: () => void — vuelve a la pantalla de Mi Progreso.
 *  - onAttempt: () => void — se dispara cuando termina una explicación
 *              (con o sin error). Úsalo para sumar progreso parcial en
 *              Mi Progreso aunque el ejercicio no se guarde como completado.
 */
function Home({ isAuthenticated, onSaveCorrect, onAttempt, exercise, onBack }) {
  const [code, setCode] = useState(exercise?.code ?? DEFAULT_CODE);

  const [mode, setMode] = useState("idle"); // idle | line | full
  const [selectedLine, setSelectedLine] = useState(null);
  const [pendingLine, setPendingLine] = useState(null);
  const [lineFragments, setLineFragments] = useState([]);
  const [isLineExplaining, setIsLineExplaining] = useState(false);

  const [fullSteps, setFullSteps] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isExplaining, setIsExplaining] = useState(false);

  const [hasError, setHasError] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [explanationStatus, setExplanationStatus] = useState("idle");
  const [saveState, setSaveState] = useState("idle");
  const [syntaxErrors, setSyntaxErrors] = useState([]);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSaveErrorModal, setShowSaveErrorModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [copiedExplanation, setCopiedExplanation] = useState(false);

  const intervalRef = useRef();
  const lineTimeoutRef = useRef();

  useEffect(
    () => () => {
      clearInterval(intervalRef.current);
      clearTimeout(lineTimeoutRef.current);
    },
    []
  );

  const lines = code.split("\n");


  // Progreso (0-100) del análisis completo, usado por la barra de carga.
  const totalFullSteps = fullSteps.length;
  const progressPercent =
    mode === "full" && totalFullSteps > 0
      ? Math.min(100, Math.round((visibleCount / totalFullSteps) * 100))
      : 0;

  const hasExplanationToCopy =
  (mode === "line" &&
    !isLineExplaining &&
    lineFragments.length > 0) ||
  (mode === "full" &&
    fullSteps.length > 0 &&
    visibleCount > 0);


  function resetExplanationState() {
    clearInterval(intervalRef.current);
    clearTimeout(lineTimeoutRef.current);
    setMode("idle");
    setSelectedLine(null);
    setPendingLine(null);
    setLineFragments([]);
    setFullSteps([]);
    setVisibleCount(0);
    setIsExplaining(false);
    setIsLineExplaining(false);
    setCanSave(false);
    setHasError(false);
    setExplanationStatus("idle");
    setSaveState("idle");
    setSyntaxErrors([]);
  }

  function handleCodeChange(event) {
    setCode(event.target.value);
    resetExplanationState();
  }

  function handleLineClick(lineNumber) {
    clearInterval(intervalRef.current);
    clearTimeout(lineTimeoutRef.current);

    const text = lines[lineNumber - 1] ?? "";
    const activeError = syntaxErrors.find((item) => item.line === lineNumber);

    setMode("line");
    setSelectedLine(lineNumber);
    setPendingLine(lineNumber);
    setLineFragments([]);
    setIsExplaining(false);
    setIsLineExplaining(true);
    setCanSave(false);
    setExplanationStatus("loading");

    lineTimeoutRef.current = setTimeout(() => {
      setPendingLine(null);
      setIsLineExplaining(false);
      setCanSave(true);
      setExplanationStatus("ready");
      if (activeError) {
        setLineFragments([
          `La línea ${lineNumber} presenta un problema: ${activeError.message}`,
          `Sugerencia: ${activeError.suggestion}`,
          `Código actual: "${text}"`,
        ]);
        setHasError(true);
      } else {
        setLineFragments(explainLine(text));
        setHasError(false);
      }
    }, 520);
  }

  function handleExplainFunction() {
    clearInterval(intervalRef.current);
    clearTimeout(lineTimeoutRef.current);
    setMode("full");
    setSelectedLine(null);
    setPendingLine(null);
    setHasError(false);
    setCanSave(false);
    setVisibleCount(0);
    setIsLineExplaining(false);
    setLineFragments([]);
    setExplanationStatus("loading");

    if (!code.trim()) {
      setFullSteps([
        {
          lineNumber: null,
          fragments: ["Escribe código y pulsa 'Explicar función' para obtener una guía paso a paso."],
        },
      ]);
      setVisibleCount(1);
      setExplanationStatus("empty");
      setCanSave(true);
      return;
    }

    const syntax = checkSyntax(code);
    setSyntaxErrors(syntax.errors);
    if (!syntax.ok) {
      setHasError(true);
      setFullSteps(
        syntax.errors.map((error) => ({
          lineNumber: error.line,
          fragments: [
            `Error en la línea ${error.line}: ${error.message}`,
            `Solución: ${error.suggestion}`,
          ],
        }))
      );
      setVisibleCount(syntax.errors.length);
      setCanSave(true);
      setExplanationStatus("error");
      onAttempt?.();
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
      if (count === 1) {
        setCanSave(true);
      }
      if (count >= stepsToShow.length) {
        clearInterval(intervalRef.current);
        setIsExplaining(false);
        setCanSave(true);
        setExplanationStatus("ready");
        onAttempt?.();
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
    setSaveState("saved");
    setShowSuccessModal(true);
    onSaveCorrect?.();
  }

  function handleSaveDraft() {
    setShowSaveErrorModal(false);
    setShowDraftModal(true);
    setSaveState("draft");
  }

  function handleClearEditor() {
    setCode("");
    resetExplanationState();
    setShowClearModal(false);
  }

  async function handleCopyExplanation() {
    let explanationText = "";
  
    if (mode === "line") {
      explanationText = lineFragments.join("\n");
    }
  
    if (mode === "full") {
      explanationText = fullSteps
        .slice(0, visibleCount)
        .flatMap((step) => {
          const lineTitle = step.lineNumber
            ? [`Línea ${step.lineNumber}`]
            : [];
  
          return [...lineTitle, ...step.fragments];
        })
        .join("\n");
    }
  
    if (!explanationText.trim()) {
      return;
    }
  
    try {
      await navigator.clipboard.writeText(explanationText);
  
      setCopiedExplanation(true);
  
      setTimeout(() => {
        setCopiedExplanation(false);
      }, 2000);
    } catch (error) {
      console.error("No se pudo copiar la explicación:", error);
    }
  }


  return (
    <div className="home-page">
      {/* Estilos locales de la barra de progreso (más notoria que el spinner anterior) */}
<style>{`
  .gesp-loading-panel {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--card-bg, #f4f6ff);
    border: 1px solid var(--border-color, #d8ddf2);
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 16px;
    font-weight: 500;
    color: var(--primary-color, #4b5bdc);
  }
  .gesp-dot-spinner {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid rgba(75, 91, 220, 0.2);
    border-top-color: var(--primary-color, #4b5bdc);
    animation: gesp-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes gesp-spin {
    to { transform: rotate(360deg); }
  }
`}</style>

      {exercise && (
        <div className="home-topbar">
          <button type="button" className="back-link" onClick={onBack}>
            ← Volver a Mi Progreso
          </button>
          <div className="home-topbar-info">
            Resolviendo: <strong>{exercise.title}</strong>
            {exercise.difficulty && (
              <span className={`badge-diff badge-diff-${exercise.difficulty.toLowerCase()}`}>
                {exercise.difficulty}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="home-container">
        {/* Columna izquierda: Editor */}
        <div className="card editor-card">
          <h2>Editor de código</h2>

          <div className="code-editor">
            <div className="line-numbers">
              {lines.map((_, idx) => {
                const lineNumber = idx + 1;
                const isSelected = selectedLine === lineNumber;
                const isLoadingLine = isLineExplaining && pendingLine === lineNumber;
                const hasLineError = syntaxErrors.some((item) => item.line === lineNumber);

                return (
                  <div
                    key={lineNumber}
                    className={`line-row ${isSelected ? "active" : ""} ${isLoadingLine ? "loading" : ""}`}
                  >
                    <button
                      type="button"
                      className={`line-number ${isSelected ? "active" : ""} ${hasLineError ? "error" : ""}`}
                      onClick={() => handleLineClick(lineNumber)}
                      title={`Explicar línea ${lineNumber}`}
                      disabled={isExplaining || isLineExplaining}
                    >
                      {lineNumber}
                    </button>

                    <button
                      type="button"
                      className={`line-action-btn ${isLoadingLine ? "loading" : ""}`}
                      onClick={() => handleLineClick(lineNumber)}
                      onMouseDown={(event) => event.preventDefault()}
                      title={`Generar explicación de la línea ${lineNumber}`}
                      aria-label={`Generar explicación de la línea ${lineNumber}`}
                      disabled={isExplaining || isLineExplaining}
                    >
                      {isLoadingLine ? (
                        <span className="line-action-loading" aria-hidden="true">
                          <span className="spinner" />
                        </span>
                      ) : (
                        <span className="line-action-icon" aria-hidden="true">
                          ▶
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="code-area-wrapper">
              {selectedLine && (
                <div
                  className={`line-highlight ${syntaxErrors.some((item) => item.line === selectedLine) ? "error" : ""}`}
                  style={{ top: `${(selectedLine - 1) * LINE_HEIGHT + CODE_EDITOR_PADDING_TOP}px` }}
                />
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

          <p className="editor-hint">Pasa el mouse por una línea para mostrar su botón de explicación individual.</p>

          <div className="editor-actions">
            <button
              type="button"
              className="btn btn-clear"
              onClick={() => setShowClearModal(true)}
              disabled={!code.trim() || isExplaining || isLineExplaining}
            >
              Limpiar editor
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleExplainFunction}
              disabled={isExplaining || isLineExplaining}
            >
              {isExplaining || isLineExplaining ? "Analizando..." : "Explicar función"}
            </button>
          </div>
        </div>

        {/* Columna derecha: Explicación */}
        <div className="card explanation-card" translate="no">
  <div className="explanation-header">
    <div>
      <h2>Explicación guiada</h2>

      <p className="mode-label" translate="no">
        <span>
          {mode === "line"
            ? "Modo: Línea individual"
            : mode === "full"
              ? "Modo: Explicación completa"
              : "Selecciona una línea o solicita una explicación completa del código."}
        </span>
      </p>
    </div>

    <div className="explanation-header-actions">
      {mode === "line" && selectedLine && (
        <span className="line-badge">
          Línea [{selectedLine}]
        </span>
      )}

      <button
        type="button"
        className={`copy-explanation-btn ${
          copiedExplanation ? "copied" : ""
        }`}
        onClick={handleCopyExplanation}
        disabled={!hasExplanationToCopy}
        title="Copiar explicación"
        translate="no"
      >
        <span>
          {copiedExplanation ? "✓ ¡Copiado!" : "⧉ Copiar"}
        </span>
      </button>
    </div>
  </div>

          <div className="explanation-body">
            {/* Barra de progreso notoria: solo para el modo "explicación completa" */}
{explanationStatus === "loading" && (
  <div className="gesp-loading-panel">
    <span className="gesp-dot-spinner" aria-hidden="true" />
    <span>
      {mode === "full" ? "Generando explicación..." : "Generando la explicación solicitada..."}
    </span>
  </div>
)}

            {/* Loading para explicación de línea individual */}
            {explanationStatus === "loading" && mode === "line" && (
              <div className="gesp-line-loading-panel">
                <span className="gesp-progress-spinner" aria-hidden="true" />
                <span>Generando la explicación solicitada...</span>
              </div>
            )}

            {explanationStatus === "empty" && (
              <div className="help-text">
                Escribe código y pulsa "Explicar función" para obtener una guía paso a paso.
              </div>
            )}

        

            {mode === "line" && explanationStatus === "ready" &&
              lineFragments.map((frag, i) => (
                <div key={i} className={`ex-step ${hasError ? "error" : ""}`}>
                  {frag}
                </div>
              ))}

            {(mode === "full" || explanationStatus === "error") &&
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
              {saveState === "saved" ? "Guardado" : saveState === "draft" ? "Borrador" : "Guardar progreso"}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Modales ===== */}

      {showClearModal && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-editor-title"
        >
          <div className="modal">
            <button
              type="button"
              className="modal-close"
              aria-label="Cerrar"
              onClick={() => setShowClearModal(false)}
            >
              ×
            </button>

            <div className="modal-icon modal-icon-warning">!</div>

            <h3 id="clear-editor-title">¿Deseas limpiar el editor?</h3>

            <p>
              Se eliminará todo el código escrito y la explicación generada.
              Esta acción no se puede deshacer.
            </p>

            <div className="modal-actions split">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowClearModal(false)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={handleClearEditor}
              >
                Limpiar código
              </button>
            </div>
          </div>
        </div>
      )}

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