import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import DocumentViewer from '../components/DocumentViewer';
import {
    Download,
    Eye,
    ShoppingCart,
    ArrowLeft,
    FileText,
    Calendar,
    User,
    Lock,
    Check,
    Loader
} from 'lucide-react';

const fileTypeLabels = {
    'application/pdf': 'PDF',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'application/vnd.ms-powerpoint': 'PowerPoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
    'application/zip': 'Archive ZIP',
    'application/x-zip-compressed': 'Archive ZIP',
    'image/jpeg': 'Image JPEG',
    'image/png': 'Image PNG',
    'image/gif': 'Image GIF',
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
};

export default function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, isOwner } = useAuth();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [showViewer, setShowViewer] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`/courses/${id}`);
                setCourse(response.data.course);
            } catch (error) {
                console.error('Error fetching course:', error);
                toast.error('Cours non trouvé');
                navigate('/courses');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id, navigate]);

    const handleDownload = async () => {
        if (!isAuthenticated) {
            toast.error('Connectez-vous pour télécharger');
            navigate('/login');
            return;
        }

        try {
            const response = await axios.get(`/courses/${id}/download`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', course.file_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Téléchargement démarré');
        } catch (error) {
            const message = error.response?.data?.error || 'Erreur de téléchargement';
            toast.error(message);
        }
    };

    const handleView = () => {
        if (!isAuthenticated) {
            toast.error('Connectez-vous pour lire ce document');
            navigate('/login');
            return;
        }
        setShowViewer(true);
    };

    const handlePurchase = async () => {
        if (!isAuthenticated) {
            toast.error('Connectez-vous pour acheter');
            navigate('/login');
            return;
        }

        setPurchasing(true);
        try {
            await axios.post('/payment/simulate', { courseId: course.id });
            toast.success('Achat effectué avec succès !');

            // Refresh course data
            const response = await axios.get(`/courses/${id}`);
            setCourse(response.data.course);
        } catch (error) {
            const message = error.response?.data?.error || 'Erreur lors du paiement';
            toast.error(message);
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-page">
                <div className="skeleton" style={{ width: '100%', maxWidth: 800, height: 400 }}></div>
            </div>
        );
    }

    if (!course) return null;

    const isFree = course.is_free === 1 || course.is_free === true;
    const hasAccess = isFree || course.purchased || isOwner;
    const fileType = fileTypeLabels[course.file_type] || 'Document';

    return (
        <div className="course-detail-page animate-fade-in">
            <div className="container">
                <Link to="/courses" className="back-link">
                    <ArrowLeft size={20} />
                    Retour aux cours
                </Link>

                <div className="course-detail-grid">
                    <div className="course-main">
                        <div className="course-header card p-6">
                            <div className="course-badges">
                                <span className="badge badge-category">{course.category}</span>
                                {isFree ? (
                                    <span className="badge badge-free">Gratuit</span>
                                ) : (
                                    <span className="badge badge-paid">{course.price?.toFixed(2)} €</span>
                                )}
                            </div>

                            <h1>{course.title}</h1>

                            <div className="course-meta-row">
                                <div className="meta-item">
                                    <User size={16} />
                                    <span>{course.owner_name}</span>
                                </div>
                                <div className="meta-item">
                                    <Calendar size={16} />
                                    <span>{formatDate(course.created_at)}</span>
                                </div>
                                <div className="meta-item">
                                    <Download size={16} />
                                    <span>{course.download_count || 0} téléchargements</span>
                                </div>
                            </div>
                        </div>

                        <div className="course-description card p-6">
                            <h3>Description</h3>
                            <p>{course.description || 'Aucune description disponible.'}</p>
                        </div>
                    </div>

                    <div className="course-sidebar">
                        <div className="course-actions card p-6">
                            <div className="file-info">
                                <FileText size={40} />
                                <div>
                                    <p className="file-name">{course.file_name}</p>
                                    <p className="file-meta">{fileType} • {formatFileSize(course.file_size)}</p>
                                </div>
                            </div>

                            {hasAccess ? (
                                <>
                                    <button onClick={handleView} className="btn btn-primary btn-lg action-btn">
                                        <Eye size={20} />
                                        Lire en ligne
                                    </button>
                                    <button onClick={handleDownload} className="btn btn-secondary btn-lg action-btn">
                                        <Download size={20} />
                                        Télécharger
                                    </button>
                                    {course.purchased && (
                                        <div className="purchased-badge">
                                            <Check size={16} />
                                            Acheté
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="locked-message">
                                        <Lock size={24} />
                                        <p>Ce cours est payant</p>
                                        <span className="price">{course.price?.toFixed(2)} €</span>
                                    </div>
                                    <button
                                        onClick={handlePurchase}
                                        className="btn btn-primary btn-lg action-btn"
                                        disabled={purchasing}
                                    >
                                        {purchasing ? (
                                            <Loader size={20} className="spin" />
                                        ) : (
                                            <ShoppingCart size={20} />
                                        )}
                                        {purchasing ? 'Traitement...' : 'Acheter maintenant'}
                                    </button>
                                    <p className="secure-payment">
                                        <Lock size={14} />
                                        Paiement sécurisé
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showViewer && (
                <DocumentViewer course={course} onClose={() => setShowViewer(false)} />
            )}

            <style>{`
        .course-detail-page {
          padding: var(--space-8) 0 var(--space-16);
        }

        .loading-page {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-8);
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--gray-400);
          margin-bottom: var(--space-6);
          transition: color var(--transition-fast);
        }

        .back-link:hover {
          color: white;
        }

        .course-detail-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: var(--space-6);
          align-items: start;
        }

        .course-main {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .course-badges {
          display: flex;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
        }

        .course-header h1 {
          font-size: var(--font-size-3xl);
          margin-bottom: var(--space-6);
        }

        .course-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-6);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--gray-400);
          font-size: var(--font-size-sm);
        }

        .course-description h3 {
          margin-bottom: var(--space-4);
        }

        .course-description p {
          color: var(--gray-300);
          line-height: 1.8;
          white-space: pre-wrap;
        }

        .course-actions {
          position: sticky;
          top: 90px;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: var(--space-4);
        }

        .file-info svg {
          color: var(--primary-500);
        }

        .file-name {
          font-weight: 600;
          word-break: break-all;
        }

        .file-meta {
          font-size: var(--font-size-sm);
          color: var(--gray-400);
        }

        .action-btn {
          width: 100%;
          margin-bottom: var(--space-3);
        }

        .purchased-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3);
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid var(--success-500);
          border-radius: var(--radius-md);
          color: var(--success-500);
          font-weight: 600;
        }

        .locked-message {
          text-align: center;
          padding: var(--space-6);
          background: var(--surface-2);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
        }

        .locked-message svg {
          color: var(--warning-500);
          margin-bottom: var(--space-2);
        }

        .locked-message p {
          color: var(--gray-400);
          margin-bottom: var(--space-2);
        }

        .locked-message .price {
          font-size: var(--font-size-2xl);
          font-weight: 800;
          color: white;
        }

        .secure-payment {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          color: var(--gray-500);
          font-size: var(--font-size-sm);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .course-detail-grid {
            grid-template-columns: 1fr;
          }

          .course-actions {
            position: static;
          }
        }
      `}</style>
        </div>
    );
}
