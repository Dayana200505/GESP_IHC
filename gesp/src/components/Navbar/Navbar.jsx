import "./Navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function Navbar({ isAuthenticated, userName, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const initials = userName
    ? userName
        .split(" ")
        .map((segment) => segment[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "GU";

  const handleAvatarClick = () => {
    navigate("/perfil");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h1>GESP</h1>
      </div>

      <ul className="navbar-links">
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? "active-link" : "")}>Inicio</NavLink>
        </li>

        {isAuthenticated && (
          <>
            <li>
              <NavLink to="/recursos" className={({ isActive }) => (isActive ? "active-link" : "")}>Recursos</NavLink>
            </li>
            <li>
              <NavLink to="/progreso" className={({ isActive }) => (isActive ? "active-link" : "")}>Mi Progreso</NavLink>
            </li>
          </>
        )}
      </ul>

      {!isAuthenticated ? (
        <div className="navbar-actions">
          <NavLink to="/register" className="auth-link">Regístrate</NavLink>
          <NavLink to="/login" className="btn btn-nav-login">Iniciar Sesión</NavLink>
        </div>
      ) : (
        <div className="navbar-profile" ref={menuRef} onClick={handleAvatarClick}>
          <span className="avatar-circle">{initials}</span>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
