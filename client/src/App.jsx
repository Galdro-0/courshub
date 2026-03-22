import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Dashboard from './pages/Dashboard';
import MyPurchases from './pages/MyPurchases';

// Protected route wrapper
function ProtectedRoute({ children, requireOwner = false }) {
    const { isAuthenticated, isOwner, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <div className="skeleton" style={{ width: 60, height: 60, borderRadius: '50%', margin: '0 auto 1rem' }}></div>
                    <p className="text-muted">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requireOwner && !isOwner) {
        return <Navigate to="/" replace />;
    }

    return children;
}

function App() {
    return (
        <div className="app">
            <Navbar />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:id" element={<CourseDetail />} />
                    <Route
                        path="/my-purchases"
                        element={
                            <ProtectedRoute>
                                <MyPurchases />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/*"
                        element={
                            <ProtectedRoute requireOwner>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
