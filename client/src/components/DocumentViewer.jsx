import { useAuth } from '../context/AuthContext';
import { X, FileText, AlertCircle } from 'lucide-react';

export default function DocumentViewer({ course, onClose }) {
    const { token } = useAuth();

    if (!course) return null;

    const isPDF = course.file_type === 'application/pdf';
    const isImage = course.file_type?.startsWith('image/');

    const viewUrl = `/api/courses/${course.id}/view`;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="viewer-modal" onClick={e => e.stopPropagation()}>
                <div className="viewer-header">
                    <div className="viewer-title">
                        <FileText size={20} />
                        <span>{course.title}</span>
                    </div>
                    <button className="viewer-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="viewer-content">
                    {isPDF ? (
                        <iframe
                            src={`${viewUrl}#toolbar=1&navpanes=0`}
                            title={course.title}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                    ) : isImage ? (
                        <div className="image-viewer">
                            <img src={viewUrl} alt={course.title} />
                        </div>
                    ) : (
                        <div className="unsupported-format">
                            <AlertCircle size={48} />
                            <h3>Prévisualisation non disponible</h3>
                            <p>Ce type de fichier ne peut pas être prévisualisé en ligne.</p>
                            <p>Veuillez télécharger le fichier pour le consulter.</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .viewer-modal {
          background: var(--bg-secondary);
          border-radius: var(--radius-xl);
          width: 95vw;
          height: 90vh;
          max-width: 1200px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideIn 0.3s ease-out;
        }

        .viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-4) var(--space-6);
          border-bottom: 1px solid var(--glass-border);
          background: var(--surface-2);
        }

        .viewer-title {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-weight: 600;
        }

        .viewer-close {
          color: var(--gray-400);
          padding: var(--space-2);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .viewer-close:hover {
          color: white;
          background: var(--surface-3);
        }

        .viewer-content {
          flex: 1;
          background: white;
          overflow: hidden;
        }

        .image-viewer {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gray-900);
          overflow: auto;
        }

        .image-viewer img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .unsupported-format {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--gray-600);
          text-align: center;
          padding: var(--space-8);
        }

        .unsupported-format h3 {
          color: var(--gray-800);
          margin: var(--space-4) 0 var(--space-2);
        }

        .unsupported-format p {
          margin: var(--space-1) 0;
        }
      `}</style>
        </div>
    );
}
