import "./Navbar.css";
import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="navbar-logo">
        <h1>GESP</h1>
      </div>

      <ul className="navbar-links">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            Inicio
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/recursos"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            Recursos
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/progreso"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            Mi Progreso
          </NavLink>
        </li>
      </ul>

      <div className="navbar-profile">
        <img
          src="https://i.pravatar.cc/100"
          alt="Perfil"
        />
      </div>

    </nav>
  );
}

export default Navbar;