import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, X } from 'lucide-react';
import CourseCard from '../components/CourseCard';

export default function Courses() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        free: searchParams.get('free') || ''
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (filters.search) params.append('search', filters.search);
                if (filters.category) params.append('category', filters.category);
                if (filters.free) params.append('free', filters.free);

                const [coursesRes, categoriesRes] = await Promise.all([
                    axios.get(`/courses?${params.toString()}`),
                    axios.get('/courses/categories')
                ]);

                setCourses(coursesRes.data.courses);
                setCategories(categoriesRes.data.categories);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filters]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Update URL
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v) params.set(k, v);
        });
        setSearchParams(params);
    };

    const clearFilters = () => {
        setFilters({ search: '', category: '', free: '' });
        setSearchParams({});
    };

    const hasActiveFilters = filters.search || filters.category || filters.free;

    return (
        <div className="courses-page animate-fade-in">
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <h1>Tous les cours</h1>
                    <p>Parcourez notre bibliothèque de documents et ressources</p>
                </div>

                {/* Filters */}
                <div className="filters-section">
                    <div className="search-box">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Rechercher un cours..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="form-input search-input"
                        />
                    </div>

                    <div className="filter-row">
                        <div className="filter-group">
                            <Filter size={18} />
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="form-select"
                            >
                                <option value="">Toutes les catégories</option>
                                {categories.map(cat => (
                                    <option key={cat.category} value={cat.category}>
                                        {cat.category} ({cat.count})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <select
                                value={filters.free}
                                onChange={(e) => handleFilterChange('free', e.target.value)}
                                className="form-select"
                            >
                                <option value="">Tous les prix</option>
                                <option value="true">Gratuit</option>
                                <option value="false">Payant</option>
                            </select>
                        </div>

                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="btn btn-secondary btn-sm">
                                <X size={16} />
                                Effacer les filtres
                            </button>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div className="results-section">
                    <p className="results-count">
                        {loading ? 'Chargement...' : `${courses.length} cours trouvé${courses.length > 1 ? 's' : ''}`}
                    </p>

                    {loading ? (
                        <div className="grid grid-3">
                            {[...Array(6)].map((_, i) => (
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
                            <Search size={48} />
                            <h3>Aucun cours trouvé</h3>
                            <p>Essayez de modifier vos critères de recherche</p>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="btn btn-primary mt-4">
                                    Effacer les filtres
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .courses-page {
          padding: var(--space-8) 0 var(--space-16);
        }

        .page-header {
          text-align: center;
          margin-bottom: var(--space-10);
        }

        .page-header h1 {
          margin-bottom: var(--space-2);
        }

        .page-header p {
          color: var(--gray-400);
        }

        .filters-section {
          margin-bottom: var(--space-8);
        }

        .search-box {
          position: relative;
          margin-bottom: var(--space-4);
        }

        .search-icon {
          position: absolute;
          left: var(--space-4);
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-500);
        }

        .search-input {
          padding-left: var(--space-12);
          font-size: var(--font-size-lg);
        }

        .filter-row {
          display: flex;
          gap: var(--space-4);
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .filter-group svg {
          color: var(--gray-500);
        }

        .filter-group .form-select {
          min-width: 200px;
        }

        .results-section {
          margin-top: var(--space-8);
        }

        .results-count {
          color: var(--gray-400);
          font-size: var(--font-size-sm);
          margin-bottom: var(--space-4);
        }

        @media (max-width: 640px) {
          .filter-group .form-select {
            min-width: 100%;
          }

          .filter-row {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}
