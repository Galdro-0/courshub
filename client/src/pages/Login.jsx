import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    LogIn,
    UserPlus,
    GraduationCap
} from 'lucide-react';

export default function Login() {
    const { login, register, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });

    // Redirect if already authenticated
    if (isAuthenticated) {
        navigate('/');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isRegister) {
                if (!formData.name.trim()) {
                    toast.error('Le nom est requis');
                    setLoading(false);
                    return;
                }
                await register(formData.email, formData.password, formData.name);
                toast.success('Compte créé avec succès !');
            } else {
                await login(formData.email, formData.password);
                toast.success('Connexion réussie !');
            }
            navigate('/');
        } catch (error) {
            const message = error.response?.data?.error || 'Une erreur est survenue';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="login-page animate-fade-in">
            <div className="login-container">
                <div className="login-card card">
                    <div className="login-header">
                        <div className="login-logo">
                            <GraduationCap size={40} />
                        </div>
                        <h1>{isRegister ? 'Créer un compte' : 'Connexion'}</h1>
                        <p>
                            {isRegister
                                ? 'Rejoignez CoursHub et accédez à tous nos cours'
                                : 'Connectez-vous pour continuer'
                            }
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {isRegister && (
                            <div className="form-group">
                                <label className="form-label">Nom complet</label>
                                <div className="input-wrapper">
                                    <User size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="form-input with-icon"
                                        placeholder="Votre nom"
                                        required={isRegister}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-input with-icon"
                                    placeholder="votre@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mot de passe</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="form-input with-icon"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg login-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading-spinner"></span>
                            ) : isRegister ? (
                                <>
                                    <UserPlus size={20} />
                                    Créer mon compte
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    Se connecter
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            {isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
                            <button
                                onClick={() => setIsRegister(!isRegister)}
                                className="switch-mode-btn"
                            >
                                {isRegister ? 'Se connecter' : "S'inscrire"}
                            </button>
                        </p>
                    </div>

                    {!isRegister && (
                        <div className="demo-credentials">
                            <p>Compte admin de démonstration :</p>
                            <code>admin@courshub.com / admin123</code>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .login-page {
          min-height: calc(100vh - 70px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-8);
        }

        .login-container {
          width: 100%;
          max-width: 440px;
        }

        .login-card {
          padding: var(--space-8);
        }

        .login-header {
          text-align: center;
          margin-bottom: var(--space-8);
        }

        .login-logo {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-4);
        }

        .login-header h1 {
          font-size: var(--font-size-2xl);
          margin-bottom: var(--space-2);
        }

        .login-header p {
          color: var(--gray-400);
        }

        .login-form {
          margin-bottom: var(--space-6);
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: var(--space-4);
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-500);
        }

        .form-input.with-icon {
          padding-left: var(--space-12);
        }

        .password-toggle {
          position: absolute;
          right: var(--space-4);
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-500);
          padding: var(--space-1);
        }

        .password-toggle:hover {
          color: var(--gray-300);
        }

        .login-btn {
          width: 100%;
          margin-top: var(--space-4);
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-footer {
          text-align: center;
          padding-top: var(--space-6);
          border-top: 1px solid var(--glass-border);
        }

        .login-footer p {
          color: var(--gray-400);
        }

        .switch-mode-btn {
          color: var(--primary-400);
          font-weight: 600;
          margin-left: var(--space-2);
        }

        .switch-mode-btn:hover {
          color: var(--primary-300);
        }

        .demo-credentials {
          text-align: center;
          margin-top: var(--space-6);
          padding: var(--space-4);
          background: var(--surface-2);
          border-radius: var(--radius-md);
        }

        .demo-credentials p {
          color: var(--gray-400);
          font-size: var(--font-size-sm);
          margin-bottom: var(--space-2);
        }

        .demo-credentials code {
          color: var(--accent-400);
          font-size: var(--font-size-sm);
        }
      `}</style>
        </div>
    );
}
