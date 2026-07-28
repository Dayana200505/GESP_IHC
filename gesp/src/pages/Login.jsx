import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function validate(values) {
  const errors = {};
  if (!values.email.trim()) {
    errors.email = "El correo electrónico es obligatorio.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Ingresa un correo electrónico válido.";
  }

  if (values.mode === "login" && !values.password) {
    errors.password = "La contraseña es obligatoria.";
  }

  if (values.mode === "verify" && !values.code.trim()) {
    errors.code = "Ingresa el código de verificación.";
  }

  return errors;
}

function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [values, setValues] = useState({ email: "", password: "", code: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showVerified, setShowVerified] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validate({ ...values, mode });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (mode === "login") {
      onLoginSuccess?.();
      navigate("/");
      return;
    }

    if (mode === "forgot") {
      setMode("verify");
      setMessage("Te enviamos un código de verificación al correo.");
      return;
    }

    if (mode === "verify") {
      setShowVerified(true);
      return;
    }
  };

  const handleVerifiedContinue = () => {
    setShowVerified(false);
    setMode("login");
    setMessage("Código verificado. Ingresa tu contraseña para continuar.");
  };

  return (
    <div className="login-page">
      <div className="login-panel login-panel-left">
        <div className="brand-badge">GESP</div>
        <h1>Comprende Haskell paso a paso</h1>
        <p className="login-subtitle">Aprende con ejemplos, ejercicios guiados y seguimiento claro de tu progreso.</p>

        <div className="code-preview">
          <div className="code-header">{`map (\\x -> x * 2) [1,2,3]`}</div>
          <div className="code-result">Resultado: [2,4,6]</div>
        </div>

        <div className="login-pill-row">
          <span className="pill-pill">Aprendizaje guiado</span>
          <span className="pill-pill">Progreso visible</span>
        </div>
      </div>

      <div className="login-panel login-panel-right">
        <div className="login-card">
          <h2>{mode === "login" ? "Bienvenido de nuevo" : mode === "forgot" ? "¿Olvidaste tu contraseña?" : "Ingresar código de verificación"}</h2>
          <p>{mode === "login" ? "Inicia sesión para continuar aprendiendo." : mode === "forgot" ? "Escribe tu correo para recibir el código." : "Revisa tu correo y escribe el código aquí."}</p>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label>
              <span>Correo electrónico</span>
              <input
                type="email"
                name="email"
                placeholder="nombre@correo.com"
                value={values.email}
                onChange={handleChange}
              />
              {errors.email && <small className="field-error">{errors.email}</small>}
            </label>

            {mode === "login" && (
              <label>
                <span>Contraseña</span>
                <input
                  type="password"
                  name="password"
                  placeholder="********"
                  value={values.password}
                  onChange={handleChange}
                />
                {errors.password && <small className="field-error">{errors.password}</small>}
              </label>
            )}

            {mode === "verify" && (
              <label>
                <span>Código de verificación</span>
                <input
                  type="text"
                  name="code"
                  placeholder="123456"
                  value={values.code}
                  onChange={handleChange}
                />
                {errors.code && <small className="field-error">{errors.code}</small>}
              </label>
            )}

            {message && <div className="info-box">{message}</div>}

            {mode === "login" ? (
              <div className="login-form-row checkbox-row">
                <label>
                  <input type="checkbox" />
                  Recordarme
                </label>
                <button type="button" className="forgot-link" onClick={() => setMode("forgot")}>¿Olvidaste tu contraseña?</button>
              </div>
            ) : null}

            <button type="submit" className="btn btn-login">
              {mode === "login" ? "Iniciar sesión" : mode === "forgot" ? "Enviar" : "Verificar Código"}
            </button>
          </form>

          <div className="login-footer">
            <span>{mode === "login" ? "¿Aún no tienes una cuenta?" : "¿Recordaste tu contraseña?"}</span>
            {mode === "login" ? (
              <Link to="/register">Regístrate</Link>
            ) : (
              <button type="button" className="link-button" onClick={() => setMode("login")}>Inicia sesión</button>
            )}
          </div>
        </div>
      </div>

      {showVerified && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Código verificado</h3>
            <p>Tu cuenta ha sido verificada correctamente.</p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleVerifiedContinue}>Continuar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
