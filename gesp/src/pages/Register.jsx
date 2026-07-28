import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const initialValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  university: "",
  acceptTerms: false
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
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
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

  return (
    <div className="register-page">
      <div className="register-panel register-panel-left">
        <div className="brand-badge">GESP</div>
        <h1>Crea tu cuenta y comienza tu ruta de aprendizaje.</h1>
        <div className="progress-list">
          <div className="progress-step">
            <span>1</span>
            <p>Practica</p>
          </div>
          <div className="progress-step">
            <span>2</span>
            <p>Comprende</p>
          </div>
          <div className="progress-step">
            <span>3</span>
            <p>Avanza</p>
          </div>
        </div>
      </div>

      <div className="register-panel register-panel-right">
        <div className="register-card">
          <h2>Crear cuenta</h2>
          <p>Completa tus datos para comenzar.</p>

          <form className="register-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <label>
                <span>Nombre completo</span>
                <input
                  name="name"
                  type="text"
                  value={values.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                />
                {errors.name && <small className="field-error">{errors.name}</small>}
              </label>

              <label>
                <span>Correo electrónico</span>
                <input
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  placeholder="nombre@correo.com"
                />
                {errors.email && <small className="field-error">{errors.email}</small>}
              </label>
            </div>

            <div className="form-row">
              <label>
                <span>Contraseña</span>
                <input
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  placeholder="********"
                />
                {errors.password && <small className="field-error">{errors.password}</small>}
              </label>

              <label>
                <span>Confirmar contraseña</span>
                <input
                  name="confirmPassword"
                  type="password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  placeholder="********"
                />
                {errors.confirmPassword && <small className="field-error">{errors.confirmPassword}</small>}
              </label>
            </div>

            <label className="full-width">
              <span>Universidad</span>
              <input
                name="university"
                type="text"
                value={values.university}
                onChange={handleChange}
                placeholder="Universidad Mayor de San Simón"
              />
              {errors.university && <small className="field-error">{errors.university}</small>}
            </label>

            <label className="checkbox-line">
              <input
                name="acceptTerms"
                type="checkbox"
                checked={values.acceptTerms}
                onChange={handleChange}
              />
              Acepto los términos y la política de privacidad.
            </label>
            {errors.acceptTerms && <small className="field-error">{errors.acceptTerms}</small>}

            <button type="submit" className="btn btn-register">Crear mi cuenta</button>
          </form>

          <div className="register-footer">
            <span>¿Ya tienes una cuenta?</span>
            <Link to="/login">Inicia sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
