import React, { useState, useRef, useEffect } from "react";
import "./Home.css";

function Home() {
  const initial = `filter even [1..10]`;
  const [code, setCode] = useState(initial);
  const [steps, setSteps] = useState([]);
  const [visible, setVisible] = useState(0);
  const [isExplaining, setIsExplaining] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [canSave, setCanSave] = useState(false);

  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showSaveErrorModal, setShowSaveErrorModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);

  const intervalRef = useRef();

  useEffect(()=> {
    return ()=> clearInterval(intervalRef.current);
  },[])

  function checkSyntax(text){
    const stack = [];
    const pairs = {')':'(',']':'[','}':'{'};
    for(let ch of text){
      if(['(','[','{'].includes(ch)) stack.push(ch);
      if([')',']','}'].includes(ch)){
        if(stack.length===0 || stack.pop() !== pairs[ch]) return {ok:false, msg: 'Paréntesis o corchetes sin cerrar correctamente.'}
      }
    }
    return stack.length===0 ? {ok:true} : {ok:false, msg:'Faltan cierres de paréntesis o corchetes.'}
  }

  function generateSteps(text){
    if(text.includes('filter')){
      return [
        'Identifica la llamada a `filter` y el predicado usado.',
        'Aplica el predicado a cada elemento de la lista.',
        'Construye una nueva lista con los elementos que cumplen la condición.'
      ];
    }
    const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
    if(lines.length===0) return ['El editor está vacío. Escribe código para obtener una explicación.'];
    return lines.map((l,i)=> `Paso ${i+1}: analiza la expresión \"${l}\" y describe su función.`)
  }

  function handleExplain(){
    clearInterval(intervalRef.current);
    setIsExplaining(true);
    setHasError(false);
    setErrorMsg("");
    setSteps([]);
    setVisible(0);
    setCanSave(false);

    const chk = checkSyntax(code);
    if(!chk.ok){
      setHasError(true);
      setErrorMsg(chk.msg);
      setIsExplaining(false);
      setSteps([`Error de sintaxis: ${chk.msg}`]);
      return;
    }

    const s = generateSteps(code);
    setSteps(s);

    let i = 0;
    intervalRef.current = setInterval(()=>{
      i += 1;
      setVisible(i);
      if(i>=s.length){
        clearInterval(intervalRef.current);
        setIsExplaining(false);
        setCanSave(true);
      }
    }, 650);
  }

  function handleSave(){
    if(hasError){
      setShowSaveErrorModal(true);
      return;
    }
    // show saved modal
    setShowSavedModal(true);
  }

  function handleSaveDraft(){
    setShowSaveErrorModal(false);
    setShowDraftModal(true);
  }

  return (
    <div className="home-container">
      <div className="card editor-card">
        <h2>Editor de código</h2>

        <textarea className="code-area" value={code} onChange={(e)=>setCode(e.target.value)} />

        <div className="editor-actions">
          <button className="primary-btn btn" onClick={handleExplain} disabled={isExplaining}>{isExplaining ? 'Explicando...' : 'Explicar función'}</button>
        </div>
      </div>

      <div className="card explanation-card">
        <h2>Explicación guiada</h2>
        <div className="explanation-body">
          {steps.slice(0, visible).map((st, idx)=> (
            <div className="ex-step" key={idx}>{st}</div>
          ))}

          {hasError && (
            <div className="error-box">{errorMsg} — Revisa la sintaxis.</div>
          )}
        </div>

        <div style={{marginTop:12}}>
          {canSave && <button className="btn btn-primary" onClick={handleSave}>Guardar progreso</button>}
        </div>
      </div>

      {showSavedModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>¡Progreso guardado correctamente!</h3>
            <div style={{marginTop:12,textAlign:'right'}}>
              <button className="btn" onClick={()=>setShowSavedModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showSaveErrorModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Hay errores en el código</h3>
            <p>{errorMsg}</p>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:12}}>
              <button className="btn" onClick={()=>setShowSaveErrorModal(false)}>Seguir editando</button>
              <button className="btn btn-primary" onClick={handleSaveDraft}>Guardar como borrador</button>
            </div>
          </div>
        </div>
      )}

      {showDraftModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Borrador guardado</h3>
            <p>El borrador se guardó correctamente.</p>
            <div style={{marginTop:12,textAlign:'right'}}>
              <button className="btn" onClick={()=>setShowDraftModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Home;
