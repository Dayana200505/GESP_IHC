import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const initialValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  university: "",
  acceptTerms: false,
};

function validate(values) {
  const errors = {};
  if (!values.name.trim()) {
    errors.name = "El nombre completo es obligatorio.";
  }

  if (!values.email.trim()) {
    errors.email = "El correo electrónico es obligatorio.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Ingresa un correo electrónico válido.";
  }

  if (!values.password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (values.password.length < 8) {
    errors.password = "La contraseña debe tener al menos 8 caracteres.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Debes confirmar tu contraseña.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  if (!values.university.trim()) {
    errors.university = "La universidad es obligatoria.";
  }

  if (!values.acceptTerms) {
    errors.acceptTerms = "Debes aceptar los términos y la política de privacidad.";
  }

  return errors;
}

function Register({ onRegisterSuccess }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onRegisterSuccess?.({ name: values.name });
      navigate("/");
    }
  };

  const fieldClass = (key) => (errors[key] ? "field field-invalid" : "field");

  return (
    <div className="register-page">
      <div className="register-shell">
        {/* Columna izquierda: identidad de marca */}
        <div className="register-panel register-panel-left">
          <div className="brand-badge">GESP</div>

          <h1>
            Crea tu cuenta y
            <br />
            comienza tu ruta
            <br />
            de aprendizaje.
          </h1>

          <div className="progress-list">
            <div className="progress-step">
              <span className="step-number">1</span>
              <p>Practica</p>
            </div>
            <div className="progress-step">
              <span className="step-number">2</span>
              <p>Comprende</p>
            </div>
            <div className="progress-step">
              <span className="step-number">3</span>
              <p>Avanza</p>
            </div>
          </div>
        </div>

        {/* Columna derecha: formulario */}
        <div className="register-panel register-panel-right">
          <div className="register-card">
            <h2>Crear cuenta</h2>
            <p className="register-card-subtitle">Completa tus datos para comenzar.</p>

            <form className="register-form" onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <label className={fieldClass("name")}>
                  <span className="field-label-text">
                    Nombre completo
                    <span className="required-mark" aria-hidden="true">*</span>
                  </span>
                  <input
                    name="name"
                    type="text"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    autoComplete="name"
                  />
                  {errors.name && <small className="field-error">{errors.name}</small>}
                </label>

                <label className={fieldClass("email")}>
                  <span className="field-label-text">
                    Correo electrónico
                    <span className="required-mark" aria-hidden="true">*</span>
                  </span>
                  <input
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    placeholder="nombre@correo.com"
                    autoComplete="email"
                  />
                  {errors.email && <small className="field-error">{errors.email}</small>}
                </label>
              </div>

              <div className="form-row">
                <label className={fieldClass("password")}>
                  <span className="field-label-text">
                    Contraseña
                    <span className="required-mark" aria-hidden="true">*</span>
                  </span>
                  <div className="password-input-wrap">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      autoComplete="new-password"
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

                <label className={fieldClass("confirmPassword")}>
                  <span className="field-label-text">
                    Confirmar contraseña
                    <span className="required-mark" aria-hidden="true">*</span>
                  </span>
                  <div className="password-input-wrap">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={values.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
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
              </div>

              <label className={`${fieldClass("university")} full-width`}>
                <span className="field-label-text">
                  Universidad
                  <span className="required-mark" aria-hidden="true">*</span>
                </span>
                <input
                  name="university"
                  type="text"
                  value={values.university}
                  onChange={handleChange}
                  placeholder="Universidad Mayor de San Simón"
                />
                {errors.university && <small className="field-error">{errors.university}</small>}
              </label>

              <div className="checkbox-block">
                <label className="checkbox-line">
                  <input
                    name="acceptTerms"
                    type="checkbox"
                    checked={values.acceptTerms}
                    onChange={handleChange}
                  />
                  <span className="field-label-text">
                    Acepto los términos y la política de privacidad.
                    <span className="required-mark" aria-hidden="true">*</span>
                  </span>
                </label>
                {errors.acceptTerms && <small className="field-error">{errors.acceptTerms}</small>}
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                Crear mi cuenta
              </button>
            </form>

            <div className="register-divider" />

            <div className="register-footer">
              <span>¿Ya tienes una cuenta?</span>{" "}
              <Link to="/login" className="footer-link">
                Inicia sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;