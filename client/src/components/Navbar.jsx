import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    GraduationCap,
    Home,
    BookOpen,
    LayoutDashboard,
    ShoppingBag,
    LogOut,
    LogIn,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, isOwner, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const navLinks = [
        { to: '/', label: 'Accueil', icon: Home },
        { to: '/courses', label: 'Cours', icon: BookOpen },
    ];

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-inner">
                    {/* Logo */}
                    <Link to="/" className="navbar-logo">
                        <GraduationCap size={32} />
                        <span>CoursHub</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="navbar-links">
                        {navLinks.map(link => (
                            <Link key={link.to} to={link.to} className="navbar-link">
                                <link.icon size={18} />
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* User Menu */}
                    <div className="navbar-user">
                        {isAuthenticated ? (
                            <>
                                {isOwner && (
                                    <Link to="/dashboard" className="btn btn-primary btn-sm">
                                        <LayoutDashboard size={16} />
                                        Dashboard
                                    </Link>
                                )}
                                <Link to="/my-purchases" className="navbar-link">
                                    <ShoppingBag size={18} />
                                    <span className="hide-mobile">Mes achats</span>
                                </Link>
                                <div className="user-info">
                                    <span className="user-name">{user?.name}</span>
                                    <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                                        <LogOut size={16} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link to="/login" className="btn btn-primary btn-sm">
                                <LogIn size={16} />
                                Connexion
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="mobile-menu">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="mobile-menu-link"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <link.icon size={20} />
                                {link.label}
                            </Link>
                        ))}
                        {isAuthenticated ? (
                            <>
                                {isOwner && (
                                    <Link
                                        to="/dashboard"
                                        className="mobile-menu-link"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <LayoutDashboard size={20} />
                                        Dashboard
                                    </Link>
                                )}
                                <Link
                                    to="/my-purchases"
                                    className="mobile-menu-link"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <ShoppingBag size={20} />
                                    Mes achats
                                </Link>
                                <button onClick={handleLogout} className="mobile-menu-link">
                                    <LogOut size={20} />
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="mobile-menu-link"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <LogIn size={20} />
                                Connexion
                            </Link>
                        )}
                    </div>
                )}
            </div>

            <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(15, 15, 35, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--glass-border);
        }

        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
          gap: var(--space-6);
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-xl);
          font-weight: 800;
          color: white;
        }

        .navbar-logo svg {
          color: var(--primary-500);
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .navbar-link {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-md);
          color: var(--gray-300);
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .navbar-link:hover {
          background: var(--surface-2);
          color: white;
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .user-name {
          font-weight: 500;
          color: var(--gray-300);
        }

        .mobile-menu-btn {
          display: none;
          color: white;
          padding: var(--space-2);
        }

        .mobile-menu {
          display: none;
          flex-direction: column;
          padding: var(--space-4) 0;
          border-top: 1px solid var(--glass-border);
        }

        .mobile-menu-link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          color: var(--gray-300);
          font-weight: 500;
          transition: all var(--transition-fast);
          width: 100%;
          text-align: left;
        }

        .mobile-menu-link:hover {
          background: var(--surface-2);
          color: white;
        }

        @media (max-width: 768px) {
          .navbar-links,
          .navbar-user {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .mobile-menu {
            display: flex;
          }

          .hide-mobile {
            display: none;
          }
        }
      `}</style>
        </nav>
    );
}
