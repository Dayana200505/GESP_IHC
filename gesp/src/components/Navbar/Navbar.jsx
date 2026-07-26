import "./Navbar.css";
import { NavLink } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  useEffect(()=>{
    function onDoc(e){
      if(menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return ()=> document.removeEventListener('click', onDoc)
  },[])
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

      <div className="navbar-profile avatar-dropdown" ref={menuRef}>
        <img
          src="https://i.pravatar.cc/100"
          alt="Perfil"
          onClick={()=>setOpen(o=>!o)}
        />

        {open && (
          <div className="avatar-menu">
            <NavLink to="/perfil">Mi Perfil</NavLink>
            <a href="#">Cerrar sesión</a>
          </div>
        )}
      </div>

    </nav>
  );
}

export default Navbar;