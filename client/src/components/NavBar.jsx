import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config.js";
import SearchForm from "./SearchForm";
import "../css/NavBar.css";
import "../css/ProfileMenu.css";

function NavBar() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (isMenuOpen && !event.target.closest('.navbar-links')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleLogoutConfirm = async () => {
    try {
      await signOut(auth);
      setShowLogoutModal(false);
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">Auto24</Link>
        
        <div className="search-container">
          <SearchForm />
        </div>

        <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <Link to="/publicados" className="nav-link">Publicados</Link>
          <Link to="/publicar" className="nav-link">Publicar</Link>
          <Link to="/about" className="nav-link">Quiénes somos?</Link>

          {user ? (
            <div className="profile-menu" ref={profileMenuRef}>
              <button 
                className="nav-link-sign"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                Mi Cuenta
              </button>
              
              <div className={`profile-dropdown ${isProfileMenuOpen ? "show" : ""}`}>
                <Link 
                  to="/perfil" 
                  className="dropdown-item"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  Editar Perfil
                </Link>
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setShowLogoutModal(true);
                  }}
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="nav-link-sign">
              Ingresar
            </Link>
          )}
        </div>

        <button 
          className="menu-toggle" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="material-symbols-outlined">
            {isMenuOpen ? "close" : "menu"}
          </span>
        </button>

        {showLogoutModal && (
          <>
            <div className="modal-overlay" onClick={() => setShowLogoutModal(false)} />
            <div className="confirmation-modal">
              <h3>¿Estás seguro de cerrar sesión?</h3>
              <div className="modal-buttons">
                <button 
                  className="modal-button cancel"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="modal-button confirm"
                  onClick={handleLogoutConfirm}
                >
                  Sí, cerrar sesión
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar;