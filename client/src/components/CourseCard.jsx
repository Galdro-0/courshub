import { Link } from 'react-router-dom';
import { FileText, Download, Lock, Tag } from 'lucide-react';

const fileTypeIcons = {
    'application/pdf': '📄',
    'application/msword': '📝',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
    'application/vnd.ms-powerpoint': '📊',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📊',
    'application/zip': '📦',
    'application/x-zip-compressed': '📦',
    'image/jpeg': '🖼️',
    'image/png': '🖼️',
    'image/gif': '🖼️',
};

const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
};

export default function CourseCard({ course }) {
    const isFree = course.is_free === 1 || course.is_free === true;
    const icon = fileTypeIcons[course.file_type] || '📄';

    return (
        <Link to={`/courses/${course.id}`} className="course-card card">
            <div className="course-card-header">
                <span className="course-icon">{icon}</span>
                <div className="course-badges">
                    {isFree ? (
                        <span className="badge badge-free">Gratuit</span>
                    ) : (
                        <span className="badge badge-paid">
                            <Tag size={10} />
                            {course.price?.toFixed(2)} €
                        </span>
                    )}
                </div>
            </div>

            <div className="course-card-body">
                <span className="badge badge-category">{course.category}</span>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">
                    {course.description?.substring(0, 100)}
                    {course.description?.length > 100 ? '...' : ''}
                </p>
            </div>

            <div className="course-card-footer">
                <div className="course-meta">
                    <FileText size={14} />
                    <span>{course.file_name}</span>
                </div>
                <div className="course-meta">
                    <Download size={14} />
                    <span>{course.download_count || 0} téléchargements</span>
                </div>
            </div>

            {!isFree && !course.purchased && (
                <div className="course-locked">
                    <Lock size={16} />
                </div>
            )}

            <style>{`
        .course-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        .course-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: var(--space-4);
          background: var(--surface-2);
        }

        .course-icon {
          font-size: 2.5rem;
        }

        .course-badges {
          display: flex;
          gap: var(--space-2);
        }

        .course-card-body {
          flex: 1;
          padding: var(--space-4);
        }

        .course-title {
          font-size: var(--font-size-lg);
          margin: var(--space-2) 0;
          line-height: 1.4;
        }

        .course-description {
          color: var(--gray-400);
          font-size: var(--font-size-sm);
          line-height: 1.5;
        }

        .course-card-footer {
          padding: var(--space-4);
          border-top: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .course-meta {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-xs);
          color: var(--gray-500);
        }

        .course-meta span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .course-locked {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          width: 32px;
          height: 32px;
          background: rgba(0, 0, 0, 0.6);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--warning-500);
        }
      `}</style>
        </Link>
    );
}
