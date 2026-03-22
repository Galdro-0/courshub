import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    BookOpen,
    Users,
    Download,
    ArrowRight,
    Sparkles,
    Shield,
    Zap,
    Star
} from 'lucide-react';
import CourseCard from '../components/CourseCard';

export default function Home() {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesRes, categoriesRes] = await Promise.all([
                    axios.get('/courses?limit=6'),
                    axios.get('/courses/categories')
                ]);
                setCourses(coursesRes.data.courses.slice(0, 6));
                setCategories(categoriesRes.data.categories);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const features = [
        {
            icon: BookOpen,
            title: 'Large bibliothèque',
            description: 'Accédez à des centaines de documents de cours de qualité'
        },
        {
            icon: Shield,
            title: 'Sécurisé',
            description: 'Vos fichiers et données sont protégés en permanence'
        },
        {
            icon: Zap,
            title: 'Téléchargement rapide',
            description: 'Téléchargez instantanément tous vos documents'
        }
    ];

    return (
        <div className="home-page animate-fade-in">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <Sparkles size={16} />
                            <span>Plateforme #1 de cours en ligne</span>
                        </div>
                        <h1 className="hero-title">
                            Apprenez sans limites avec{' '}
                            <span className="text-gradient">CoursHub</span>
                        </h1>
                        <p className="hero-subtitle">
                            Accédez à une bibliothèque complète de documents de cours.
                            PDF, présentations, exercices - tout ce dont vous avez besoin pour réussir.
                        </p>
                        <div className="hero-actions">
                            <Link to="/courses" className="btn btn-primary btn-lg">
                                <BookOpen size={20} />
                                Explorer les cours
                            </Link>
                            <Link to="/login" className="btn btn-secondary btn-lg">
                                Commencer gratuitement
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <BookOpen size={24} />
                                <span>500+ Cours</span>
                            </div>
                            <div className="hero-stat">
                                <Users size={24} />
                                <span>10k+ Utilisateurs</span>
                            </div>
                            <div className="hero-stat">
                                <Download size={24} />
                                <span>50k+ Téléchargements</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-card card">
                            <div className="hero-card-icon">🎓</div>
                            <h3>Cours Premium</h3>
                            <p>Documents de qualité professionnelle</p>
                            <div className="hero-card-stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill="var(--warning-500)" color="var(--warning-500)" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features">
                <div className="container">
                    <div className="grid grid-3">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card card p-6">
                                <div className="feature-icon">
                                    <feature.icon size={28} />
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            {categories.length > 0 && (
                <section className="categories-section">
                    <div className="container">
                        <h2 className="section-title">Parcourir par catégorie</h2>
                        <div className="categories-list">
                            {categories.slice(0, 8).map((cat, index) => (
                                <Link
                                    key={index}
                                    to={`/courses?category=${encodeURIComponent(cat.category)}`}
                                    className="category-chip"
                                >
                                    {cat.category}
                                    <span className="category-count">{cat.count}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Recent Courses */}
            <section className="courses-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Cours récents</h2>
                        <Link to="/courses" className="btn btn-secondary">
                            Voir tout
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="skeleton" style={{ height: 280 }}></div>
                            ))}
                        </div>
                    ) : courses.length > 0 ? (
                        <div className="grid grid-3">
                            {courses.map(course => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <BookOpen size={48} />
                            <p>Aucun cours disponible pour le moment</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card card p-8">
                        <h2>Prêt à commencer ?</h2>
                        <p>Rejoignez des milliers d'étudiants qui réussissent avec CoursHub</p>
                        <Link to="/login" className="btn btn-primary btn-lg">
                            Créer un compte gratuit
                        </Link>
                    </div>
                </div>
            </section>

            <style>{`
        .home-page {
          padding-bottom: var(--space-20);
        }

        /* Hero */
        .hero {
          padding: var(--space-16) 0;
          position: relative;
          overflow: hidden;
        }

        .hero .container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-12);
          align-items: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background: var(--surface-2);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-full);
          font-size: var(--font-size-sm);
          color: var(--primary-400);
          margin-bottom: var(--space-6);
        }

        .hero-title {
          font-size: var(--font-size-5xl);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: var(--space-6);
        }

        .hero-subtitle {
          font-size: var(--font-size-lg);
          color: var(--gray-400);
          line-height: 1.7;
          margin-bottom: var(--space-8);
          max-width: 520px;
        }

        .hero-actions {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-10);
        }

        .hero-stats {
          display: flex;
          gap: var(--space-8);
        }

        .hero-stat {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--gray-400);
          font-weight: 500;
        }

        .hero-stat svg {
          color: var(--primary-500);
        }

        .hero-visual {
          display: flex;
          justify-content: center;
        }

        .hero-card {
          padding: var(--space-8);
          text-align: center;
          animation: float 6s ease-in-out infinite;
        }

        .hero-card-icon {
          font-size: 4rem;
          margin-bottom: var(--space-4);
        }

        .hero-card h3 {
          margin-bottom: var(--space-2);
        }

        .hero-card p {
          color: var(--gray-400);
          font-size: var(--font-size-sm);
          margin-bottom: var(--space-4);
        }

        .hero-card-stars {
          display: flex;
          justify-content: center;
          gap: var(--space-1);
        }

        /* Features */
        .features {
          padding: var(--space-12) 0;
        }

        .feature-card {
          text-align: center;
        }

        .feature-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-4);
        }

        .feature-card h3 {
          margin-bottom: var(--space-2);
        }

        .feature-card p {
          color: var(--gray-400);
          font-size: var(--font-size-sm);
        }

        /* Categories */
        .categories-section {
          padding: var(--space-12) 0;
        }

        .section-title {
          margin-bottom: var(--space-8);
        }

        .categories-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
        }

        .category-chip {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background: var(--surface-2);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-full);
          font-size: var(--font-size-sm);
          color: var(--gray-300);
          transition: all var(--transition-fast);
        }

        .category-chip:hover {
          border-color: var(--primary-500);
          color: white;
        }

        .category-count {
          background: var(--surface-3);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-full);
          font-size: var(--font-size-xs);
        }

        /* Courses Section */
        .courses-section {
          padding: var(--space-12) 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-8);
        }

        /* CTA */
        .cta-section {
          padding: var(--space-12) 0;
        }

        .cta-card {
          text-align: center;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
        }

        .cta-card h2 {
          margin-bottom: var(--space-2);
        }

        .cta-card p {
          color: var(--gray-400);
          margin-bottom: var(--space-6);
        }

        @media (max-width: 1024px) {
          .hero .container {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .hero-subtitle {
            max-width: 100%;
          }

          .hero-actions {
            justify-content: center;
            flex-wrap: wrap;
          }

          .hero-stats {
            justify-content: center;
          }

          .hero-visual {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .hero-title {
            font-size: var(--font-size-3xl);
          }

          .hero-stats {
            flex-direction: column;
            gap: var(--space-4);
          }
        }
      `}</style>
        </div>
    );
}
