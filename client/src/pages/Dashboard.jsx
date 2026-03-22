import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Download,
    Settings,
    Plus,
    Pencil,
    Trash2,
    X,
    Upload,
    DollarSign,
    TrendingUp
} from 'lucide-react';

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Dashboard Overview
function DashboardOverview() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/admin/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 120 }}></div>
                ))}
            </div>
        );
    }

    return (
        <div>
            <h2>Vue d'ensemble</h2>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        <BookOpen size={24} />
                    </div>
                    <div className="stat-value">{stats?.stats?.totalCourses || 0}</div>
                    <div className="stat-label">Cours</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #06b6d4, #22d3ee)' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-value">{stats?.stats?.totalUsers || 0}</div>
                    <div className="stat-label">Utilisateurs</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #4ade80)' }}>
                        <Download size={24} />
                    </div>
                    <div className="stat-value">{stats?.stats?.totalDownloads || 0}</div>
                    <div className="stat-label">Téléchargements</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-value">{stats?.stats?.totalRevenue?.toFixed(2) || 0} €</div>
                    <div className="stat-label">Revenus</div>
                </div>
            </div>

            <div className="dashboard-sections">
                <div className="section-card card p-6">
                    <h3><TrendingUp size={20} /> Cours populaires</h3>
                    {stats?.topCourses?.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Titre</th>
                                    <th>Téléchargements</th>
                                    <th>Achats</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.topCourses.map(course => (
                                    <tr key={course.id}>
                                        <td>{course.title}</td>
                                        <td>{course.download_count}</td>
                                        <td>{course.purchase_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-muted">Aucun cours disponible</p>
                    )}
                </div>

                <div className="section-card card p-6">
                    <h3><DollarSign size={20} /> Achats récents</h3>
                    {stats?.recentPurchases?.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Utilisateur</th>
                                    <th>Cours</th>
                                    <th>Montant</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentPurchases.slice(0, 5).map(purchase => (
                                    <tr key={purchase.id}>
                                        <td>{purchase.user_name}</td>
                                        <td>{purchase.course_title}</td>
                                        <td>{purchase.amount?.toFixed(2)} €</td>
                                        <td>{formatDate(purchase.purchased_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-muted">Aucun achat récent</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Course Management
function CourseManagement() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        is_free: true,
        price: 0
    });
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('/courses');
            setCourses(response.data.courses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const openModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({
                title: course.title,
                description: course.description || '',
                category: course.category,
                is_free: course.is_free === 1 || course.is_free === true,
                price: course.price || 0
            });
        } else {
            setEditingCourse(null);
            setFormData({
                title: '',
                description: '',
                category: '',
                is_free: true,
                price: 0
            });
        }
        setFile(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('is_free', formData.is_free);
        data.append('price', formData.price);
        if (file) {
            data.append('file', file);
        }

        try {
            if (editingCourse) {
                await axios.put(`/courses/${editingCourse.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Cours mis à jour');
            } else {
                if (!file) {
                    toast.error('Veuillez sélectionner un fichier');
                    setSubmitting(false);
                    return;
                }
                await axios.post('/courses', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Cours créé');
            }
            setShowModal(false);
            fetchCourses();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (course) => {
        if (!confirm(`Supprimer "${course.title}" ?`)) return;

        try {
            await axios.delete(`/courses/${course.id}`);
            toast.success('Cours supprimé');
            fetchCourses();
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    return (
        <div>
            <div className="section-header">
                <h2>Gestion des cours</h2>
                <button onClick={() => openModal()} className="btn btn-primary">
                    <Plus size={18} />
                    Ajouter un cours
                </button>
            </div>

            {loading ? (
                <div className="skeleton" style={{ height: 300 }}></div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Titre</th>
                                <th>Catégorie</th>
                                <th>Type</th>
                                <th>Prix</th>
                                <th>Téléchargements</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(course => (
                                <tr key={course.id}>
                                    <td><strong>{course.title}</strong></td>
                                    <td><span className="badge badge-category">{course.category}</span></td>
                                    <td>
                                        {course.is_free ? (
                                            <span className="badge badge-free">Gratuit</span>
                                        ) : (
                                            <span className="badge badge-paid">Payant</span>
                                        )}
                                    </td>
                                    <td>{course.is_free ? '-' : `${course.price?.toFixed(2)} €`}</td>
                                    <td>{course.download_count || 0}</td>
                                    <td>
                                        <div className="action-btns">
                                            <button onClick={() => openModal(course)} className="btn btn-secondary btn-sm">
                                                <Pencil size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(course)} className="btn btn-danger btn-sm">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {courses.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted p-8">Aucun cours</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingCourse ? 'Modifier le cours' : 'Nouveau cours'}</h3>
                            <button onClick={() => setShowModal(false)} className="modal-close">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Titre *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input form-textarea"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Catégorie *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="ex: Mathématiques, Informatique..."
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <select
                                        className="form-select"
                                        value={formData.is_free ? 'free' : 'paid'}
                                        onChange={e => setFormData({ ...formData, is_free: e.target.value === 'free' })}
                                    >
                                        <option value="free">Gratuit</option>
                                        <option value="paid">Payant</option>
                                    </select>
                                </div>
                                {!formData.is_free && (
                                    <div className="form-group">
                                        <label className="form-label">Prix (€) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="form-input"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                            required={!formData.is_free}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Fichier {!editingCourse && '*'}</label>
                                <div className="file-upload">
                                    <input
                                        type="file"
                                        id="file-input"
                                        onChange={e => setFile(e.target.files[0])}
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.jpg,.jpeg,.png,.gif"
                                    />
                                    <label htmlFor="file-input" className="file-upload-label">
                                        <Upload size={20} />
                                        <span>{file ? file.name : 'Choisir un fichier'}</span>
                                    </label>
                                    {editingCourse && !file && (
                                        <p className="text-sm text-muted">Fichier actuel: {editingCourse.file_name}</p>
                                    )}
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// User Management
function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('/admin/users');
                setUsers(response.data.users);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleDelete = async (user) => {
        if (user.role === 'owner') {
            toast.error('Impossible de supprimer un administrateur');
            return;
        }
        if (!confirm(`Supprimer l'utilisateur "${user.name}" ?`)) return;

        try {
            await axios.delete(`/admin/users/${user.id}`);
            toast.success('Utilisateur supprimé');
            setUsers(users.filter(u => u.id !== user.id));
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    return (
        <div>
            <h2>Gestion des utilisateurs</h2>

            {loading ? (
                <div className="skeleton" style={{ height: 300 }}></div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Rôle</th>
                                <th>Achats</th>
                                <th>Téléchargements</th>
                                <th>Inscrit le</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td><strong>{user.name}</strong></td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`badge ${user.role === 'owner' ? 'badge-paid' : 'badge-category'}`}>
                                            {user.role === 'owner' ? 'Admin' : 'Utilisateur'}
                                        </span>
                                    </td>
                                    <td>{user.purchase_count || 0}</td>
                                    <td>{user.download_count || 0}</td>
                                    <td>{formatDate(user.created_at)}</td>
                                    <td>
                                        {user.role !== 'owner' && (
                                            <button onClick={() => handleDelete(user)} className="btn btn-danger btn-sm">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// Settings
function SettingsPage() {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get('/admin/settings');
                setSettings(response.data.settings);
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put('/admin/settings', settings);
            toast.success('Paramètres enregistrés');
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="skeleton" style={{ height: 200 }}></div>;
    }

    return (
        <div>
            <h2>Paramètres</h2>

            <div className="settings-card card p-6">
                <div className="form-group">
                    <label className="form-label">Nom du site</label>
                    <input
                        type="text"
                        className="form-input"
                        value={settings.site_name || ''}
                        onChange={e => setSettings({ ...settings, site_name: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-input form-textarea"
                        value={settings.site_description || ''}
                        onChange={e => setSettings({ ...settings, site_description: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label className="toggle-label">
                        <input
                            type="checkbox"
                            checked={settings.payment_enabled === 'true'}
                            onChange={e => setSettings({ ...settings, payment_enabled: e.target.checked ? 'true' : 'false' })}
                        />
                        <span>Activer les paiements</span>
                    </label>
                </div>
                <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                    {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                </button>
            </div>
        </div>
    );
}

// Main Dashboard Component
export default function Dashboard() {
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard },
        { path: '/dashboard/courses', label: 'Cours', icon: BookOpen },
        { path: '/dashboard/users', label: 'Utilisateurs', icon: Users },
        { path: '/dashboard/settings', label: 'Paramètres', icon: Settings },
    ];

    return (
        <div className="dashboard-page">
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <LayoutDashboard size={24} />
                    <span>Dashboard Admin</span>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            <main className="dashboard-main">
                <div className="dashboard-content">
                    <Routes>
                        <Route index element={<DashboardOverview />} />
                        <Route path="courses" element={<CourseManagement />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Routes>
                </div>
            </main>

            <style>{`
        .dashboard-page {
          display: flex;
          min-height: calc(100vh - 70px);
        }

        .dashboard-sidebar {
          width: 260px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--glass-border);
          padding: var(--space-6);
          flex-shrink: 0;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-weight: 700;
          font-size: var(--font-size-lg);
          margin-bottom: var(--space-8);
          color: var(--primary-400);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          color: var(--gray-400);
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .sidebar-link:hover,
        .sidebar-link.active {
          background: var(--surface-2);
          color: white;
        }

        .sidebar-link.active {
          background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
        }

        .dashboard-main {
          flex: 1;
          padding: var(--space-8);
          overflow-y: auto;
        }

        .dashboard-content {
          max-width: 1200px;
        }

        .dashboard-content h2 {
          margin-bottom: var(--space-6);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-8);
        }

        .stat-card {
          padding: var(--space-6);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-4);
        }

        .dashboard-sections {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-6);
        }

        .section-card h3 {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
          font-size: var(--font-size-lg);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-6);
        }

        .action-btns {
          display: flex;
          gap: var(--space-2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-6);
          border-bottom: 1px solid var(--glass-border);
        }

        .modal-close {
          color: var(--gray-400);
          padding: var(--space-2);
        }

        .modal-body {
          padding: var(--space-6);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
          margin-top: var(--space-6);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        .file-upload input[type="file"] {
          display: none;
        }

        .file-upload-label {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background: var(--surface-2);
          border: 2px dashed var(--glass-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .file-upload-label:hover {
          border-color: var(--primary-500);
        }

        .settings-card {
          max-width: 600px;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          cursor: pointer;
        }

        .toggle-label input {
          width: 18px;
          height: 18px;
          accent-color: var(--primary-500);
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-sections {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-page {
            flex-direction: column;
          }

          .dashboard-sidebar {
            width: 100%;
            padding: var(--space-4);
          }

          .sidebar-header {
            margin-bottom: var(--space-4);
          }

          .sidebar-nav {
            flex-direction: row;
            overflow-x: auto;
          }

          .sidebar-link {
            white-space: nowrap;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
