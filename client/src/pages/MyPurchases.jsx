import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, Download, Eye, Calendar, FileText } from 'lucide-react';
import DocumentViewer from '../components/DocumentViewer';

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

export default function MyPurchases() {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingCourse, setViewingCourse] = useState(null);

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                const response = await axios.get('/payment/purchases');
                setPurchases(response.data.purchases);
            } catch (error) {
                console.error('Error fetching purchases:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPurchases();
    }, []);

    const handleDownload = async (purchase) => {
        try {
            const response = await axios.get(`/courses/${purchase.course_id}/download`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', purchase.title);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
        }
    };

    return (
        <div className="purchases-page animate-fade-in">
            <div className="container">
                <div className="page-header">
                    <ShoppingBag size={32} />
                    <h1>Mes achats</h1>
                    <p>Retrouvez ici tous les cours que vous avez achetés</p>
                </div>

                {loading ? (
                    <div className="grid grid-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="skeleton" style={{ height: 120 }}></div>
                        ))}
                    </div>
                ) : purchases.length > 0 ? (
                    <div className="purchases-list">
                        {purchases.map(purchase => (
                            <div key={purchase.id} className="purchase-card card">
                                <div className="purchase-info">
                                    <div className="purchase-icon">
                                        <FileText size={24} />
                                    </div>
                                    <div className="purchase-details">
                                        <Link to={`/courses/${purchase.course_id}`} className="purchase-title">
                                            {purchase.title}
                                        </Link>
                                        <div className="purchase-meta">
                                            <span className="badge badge-category">{purchase.category}</span>
                                            <span className="purchase-date">
                                                <Calendar size={14} />
                                                Acheté le {formatDate(purchase.purchased_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="purchase-amount">
                                        {purchase.amount?.toFixed(2)} €
                                    </div>
                                </div>
                                <div className="purchase-actions">
                                    <button
                                        onClick={() => setViewingCourse({ id: purchase.course_id, title: purchase.title, file_type: 'application/pdf' })}
                                        className="btn btn-secondary btn-sm"
                                    >
                                        <Eye size={16} />
                                        Lire
                                    </button>
                                    <button
                                        onClick={() => handleDownload(purchase)}
                                        className="btn btn-primary btn-sm"
                                    >
                                        <Download size={16} />
                                        Télécharger
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <ShoppingBag size={64} />
                        <h3>Aucun achat</h3>
                        <p>Vous n'avez pas encore acheté de cours</p>
                        <Link to="/courses" className="btn btn-primary mt-4">
                            Explorer les cours
                        </Link>
                    </div>
                )}
            </div>

            {viewingCourse && (
                <DocumentViewer course={viewingCourse} onClose={() => setViewingCourse(null)} />
            )}

            <style>{`
        .purchases-page {
          padding: var(--space-8) 0 var(--space-16);
        }

        .page-header {
          text-align: center;
          margin-bottom: var(--space-10);
        }

        .page-header svg {
          color: var(--primary-500);
          margin-bottom: var(--space-4);
        }

        .page-header h1 {
          margin-bottom: var(--space-2);
        }

        .page-header p {
          color: var(--gray-400);
        }

        .purchases-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .purchase-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-4) var(--space-6);
          gap: var(--space-4);
        }

        .purchase-info {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          flex: 1;
        }

        .purchase-icon {
          width: 48px;
          height: 48px;
          background: var(--surface-2);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-500);
        }

        .purchase-details {
          flex: 1;
        }

        .purchase-title {
          font-weight: 600;
          display: block;
          margin-bottom: var(--space-2);
        }

        .purchase-title:hover {
          color: var(--primary-400);
        }

        .purchase-meta {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex-wrap: wrap;
        }

        .purchase-date {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          color: var(--gray-500);
          font-size: var(--font-size-sm);
        }

        .purchase-amount {
          font-size: var(--font-size-lg);
          font-weight: 700;
          color: var(--success-500);
        }

        .purchase-actions {
          display: flex;
          gap: var(--space-2);
        }

        @media (max-width: 768px) {
          .purchase-card {
            flex-direction: column;
            align-items: stretch;
          }

          .purchase-info {
            flex-direction: column;
            text-align: center;
          }

          .purchase-meta {
            justify-content: center;
          }

          .purchase-amount {
            text-align: center;
            margin: var(--space-2) 0;
          }

          .purchase-actions {
            justify-content: center;
          }
        }
      `}</style>
        </div>
    );
}
