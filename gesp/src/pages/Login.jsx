import React, { useState, useRef } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const CODE_LENGTH = 6;
const MIN_PASSWORD_LENGTH = 8;

function validate(values) {
  const errors = {};

  if (values.mode !== "reset") {
    if (!values.email.trim()) {
      errors.email = "El correo electrónico es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = "Ingresa un correo electrónico válido.";
    }
  }

  if (values.mode === "login" && !values.password) {
    errors.password = "La contraseña es obligatoria.";
  }

  if (values.mode === "verify") {
    const codeValue = values.code.join("");
    if (codeValue.length < CODE_LENGTH) {
      errors.code = "Ingresa los 6 dígitos del código.";
    }
  }

  if (values.mode === "reset") {
    if (!values.newPassword) {
      errors.newPassword = "La nueva contraseña es obligatoria.";
    } else if (values.newPassword.length < MIN_PASSWORD_LENGTH) {
      errors.newPassword = `Debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = "Confirma tu nueva contraseña.";
    } else if (values.newPassword !== values.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
    }
  }

  return errors;
}

function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState("login"); // login | forgot | verify | reset
  const [values, setValues] = useState({
    email: "",
    password: "",
    code: Array(CODE_LENGTH).fill(""),
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showVerified, setShowVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const codeInputsRef = useRef([]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setMessage("");
  };

  const handleCodeDigitChange = (index, rawValue) => {
    const digit = rawValue.replace(/[^0-9]/g, "").slice(-1);

    setValues((prev) => {
      const newCode = [...prev.code];
      newCode[index] = digit;
      return { ...prev, code: newCode };
    });
    setErrors((prev) => ({ ...prev, code: "" }));
    setMessage("");

    if (digit && index < CODE_LENGTH - 1) {
      codeInputsRef.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      if (!values.code[index] && index > 0) {
        codeInputsRef.current[index - 1]?.focus();
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      codeInputsRef.current[index + 1]?.focus();
    }
  };

  const handleCodePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;

    const newCode = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      newCode[i] = char;
    });

    setValues((prev) => ({ ...prev, code: newCode }));
    setErrors((prev) => ({ ...prev, code: "" }));

    const nextIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    codeInputsRef.current[nextIndex]?.focus();
  };

  const resetSensitiveFields = () => {
    setValues((prev) => ({
      ...prev,
      password: "",
      code: Array(CODE_LENGTH).fill(""),
      newPassword: "",
      confirmPassword: "",
    }));
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
      // Aquí iría la llamada al backend para validar el código.
      setShowVerified(true);
      return;
    }

    if (mode === "reset") {
      // Aquí iría la llamada al backend para guardar la nueva contraseña.
      setMode("login");
      resetSensitiveFields();
      setMessage("Tu contraseña se actualizó correctamente. Inicia sesión.");
      return;
    }
  };

  const handleVerifiedContinue = () => {
    setShowVerified(false);
    setMode("reset");
    setMessage("");
  };

  const titles = {
    login: "Bienvenido de nuevo",
    forgot: "¿Olvidaste tu contraseña?",
    verify: "Ingresa el código de verificación",
    reset: "Crea tu nueva contraseña",
  };

  const subtitles = {
    login: "Inicia sesión para continuar aprendiendo.",
    forgot: "Ingresa el correo electrónico de tu cuenta.",
    verify: "Ingresa el código de verificación que enviamos a tu correo electrónico.",
    reset: "Elige una contraseña segura para tu cuenta.",
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
              {mode !== "reset" && (
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
                    disabled={mode === "verify"}
                  />
                  {errors.email && <small className="field-error">{errors.email}</small>}
                </label>
              )}

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
                <div className={errors.code ? "field field-invalid" : "field"}>
                  <span className="field-label-text">
                    Código de verificación
                    <span className="required-mark" aria-hidden="true">*</span>
                  </span>
                  <div className="code-input-group">
                    {values.code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (codeInputsRef.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="code-digit-input"
                        value={digit}
                        onChange={(e) => handleCodeDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                        onPaste={index === 0 ? handleCodePaste : undefined}
                        autoComplete="one-time-code"
                        aria-label={`Dígito ${index + 1} del código de verificación`}
                      />
                    ))}
                  </div>
                  {errors.code && <small className="field-error">{errors.code}</small>}
                </div>
              )}

              {mode === "reset" && (
                <>
                  <label className={errors.newPassword ? "field field-invalid" : "field"}>
                    <span className="field-label-text">
                      Nueva contraseña
                      <span className="required-mark" aria-hidden="true">*</span>
                    </span>
                    <div className="password-input-wrap">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        placeholder="Mínimo 8 caracteres"
                        value={values.newPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        aria-label={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        <span aria-hidden="true">
                          {showNewPassword ? <FiEyeOff /> : <FiEye />}
                        </span>
                      </button>
                    </div>
                    {errors.newPassword && <small className="field-error">{errors.newPassword}</small>}
                  </label>

                  <label className={errors.confirmPassword ? "field field-invalid" : "field"}>
                    <span className="field-label-text">
                      Confirmar contraseña
                      <span className="required-mark" aria-hidden="true">*</span>
                    </span>
                    <div className="password-input-wrap">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Repite tu nueva contraseña"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        <span aria-hidden="true">
                          {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        </span>
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <small className="field-error">{errors.confirmPassword}</small>
                    )}
                  </label>
                </>
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
                    onClick={() => {
                      setMode("forgot");
                      setMessage("");
                      setErrors({});
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block">
                {mode === "login" && "Iniciar sesión"}
                {mode === "forgot" && "Enviar"}
                {mode === "verify" && "Verificar código"}
                {mode === "reset" && "Guardar contraseña"}
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
                  <button
                    type="button"
                    className="footer-link link-button"
                    onClick={() => {
                      setMode("login");
                      resetSensitiveFields();
                      setMessage("");
                      setErrors({});
                    }}
                  >
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
            <p>Ahora puedes crear tu nueva contraseña.</p>
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