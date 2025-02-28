import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase/config"; // Asegúrate de tener configurado Firebase
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import GoogleButton from "react-google-button"; // Opcional: instala con npm i react-google-button
import "../css/LoginForm.css"

function LoginForm({ isLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleTraditionalAuth = async (e) => {
        e.preventDefault();
        setError("");
        
        if (!isLogin && password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        try {
            setLoading(true);
            if (isLogin) {
                // Inicio de sesión
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // Registro
                await createUserWithEmailAndPassword(auth, email, password);
            }
            navigate("/"); // Redirige al home después de autenticar
        } catch (err) {
            setError(handleAuthError(err.code));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        try {
            setLoading(true);
            await signInWithPopup(auth, googleProvider);
            navigate("/");
        } catch (err) {
            setError(handleAuthError(err.code));
        } finally {
            setLoading(false);
        }
    };

    const handleAuthError = (errorCode) => {
        switch (errorCode) {
            case "auth/invalid-email":
                return "Email inválido";
            case "auth/user-disabled":
                return "Cuenta deshabilitada";
            case "auth/user-not-found":
                return "Usuario no registrado";
            case "auth/wrong-password":
                return "Contraseña incorrecta";
            case "auth/email-already-in-use":
                return "El email ya está registrado";
            case "auth/weak-password":
                return "La contraseña debe tener al menos 6 caracteres";
            default:
                return "Error en la autenticación";
        }
    };

    return (
        <div className="auth-wrapper">
            <form onSubmit={handleTraditionalAuth}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo electrónico"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    required
                />
                
                {!isLogin && (
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar contraseña"
                        required
                    />
                )}

                {error && <div className="auth-error">{error}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? "Cargando..." : (isLogin ? "Ingresar" : "Registrarse")}
                </button>
            </form>

            <div className="auth-separator">
                <span>o</span>
            </div>

            <GoogleButton
                onClick={handleGoogleAuth}
                label={isLogin ? "Iniciar con Google" : "Registrarse con Google"}
                disabled={loading}
                style={{ width: "100%", borderRadius: "4px" }}
            />
        </div>
    );
}

export default LoginForm;