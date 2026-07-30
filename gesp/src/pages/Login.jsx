import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
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
  const [mode, setMode] = useState("login"); // login | forgot | verify
  const [values, setValues] = useState({ email: "", password: "", code: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showVerified, setShowVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const titles = {
    login: "Bienvenido de nuevo",
    forgot: "¿Olvidaste tu contraseña?",
    verify: "Ingresa el código de verificación",
  };

  const subtitles = {
    login: "Inicia sesión para continuar aprendiendo.",
    forgot: "Ingresa el correo electrónico de tu cuenta.",
    verify: "Ingresa el código de verificación que enviamos a tu correo electrónico.",
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        {/* Columna izquierda: identidad de marca */}
        <div className="login-panel login-panel-left">
          <div className="brand-badge">GESP</div>

          <h1>
            Comprende Haskell
            <br />
            paso a paso
          </h1>
          <p className="login-subtitle">
            Explicaciones claras, ejercicios guiados y seguimiento de tu progreso.
          </p>

          <div className="code-preview">
            <div className="code-preview-line">
              <span className="code-fn">map</span> (\x -&gt; x * 2) [1,2,3]
            </div>
            <div className="code-result">Resultado: [2,4,6]</div>
          </div>

          <div className="login-pill-row">
            <span className="pill-pill">Aprendizaje guiado</span>
            <span className="pill-pill">Progreso visible</span>
          </div>
        </div>

        {/* Columna derecha: formulario */}
        <div className="login-panel login-panel-right">
          <div className="login-card">
            <h2>{titles[mode]}</h2>
            <p className="login-card-subtitle">{subtitles[mode]}</p>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <label className={errors.email ? "field field-invalid" : "field"}>
                <span className="field-label-text">
                  Correo electrónico
                  <span className="required-mark" aria-hidden="true">*</span>
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="nombre@correo.com"
                  value={values.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && <small className="field-error">{errors.email}</small>}
              </label>

              {mode === "login" && (
                <label className={errors.password ? "field field-invalid" : "field"}>
                  <span className="field-label-text">
                    Contraseña
                    <span className="required-mark" aria-hidden="true">*</span>
                  </span>
                  <div className="password-input-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={values.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      <span aria-hidden="true">
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </span>
                    </button>
                  </div>
                  {errors.password && <small className="field-error">{errors.password}</small>}
                </label>
              )}

              {mode === "verify" && (
                <label className={errors.code ? "field field-invalid" : "field"}>
                  <span className="field-label-text">
                    Código de verificación
                    <span className="required-mark" aria-hidden="true">*</span>
                  </span>
                  <input
                    type="text"
                    name="code"
                    placeholder="Ingresa el código"
                    value={values.code}
                    onChange={handleChange}
                    inputMode="numeric"
                  />
                  {errors.code && <small className="field-error">{errors.code}</small>}
                </label>
              )}

              {message && <div className="info-box">{message}</div>}

              {mode === "login" && (
                <div className="login-form-row checkbox-row">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Recordarme</span>
                  </label>
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => setMode("forgot")}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block">
                {mode === "login" ? "Iniciar sesión" : mode === "forgot" ? "Enviar" : "Verificar Código"}
              </button>
            </form>

            <div className="login-divider" />

            <div className="login-footer">
              {mode === "login" ? (
                <>
                  <span>¿Aún no tienes una cuenta?</span>{" "}
                  <Link to="/register" className="footer-link">
                    Regístrate
                  </Link>
                </>
              ) : (
                <>
                  <span>¿Recordaste tu contraseña?</span>{" "}
                  <button type="button" className="footer-link link-button" onClick={() => setMode("login")}>
                    Inicia sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showVerified && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <button
              type="button"
              className="modal-close"
              aria-label="Cerrar"
              onClick={handleVerifiedContinue}
            >
              ×
            </button>
            <div className="modal-icon modal-icon-success">✓</div>
            <h3>Código verificado</h3>
            <p>Tu cuenta ha sido verificada correctamente.</p>
            <div className="modal-actions">
              <button className="btn btn-primary btn-block" onClick={handleVerifiedContinue}>
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;