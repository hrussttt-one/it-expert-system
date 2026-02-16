import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';

export default function DashboardPage() {
    const { t } = useTranslation();
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchProjects();
        }
    }, [user, profile]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (profile?.role !== 'admin') {
                query = query.eq('user_id', user.id);
            }

            const { data, error } = await query;
            if (error) throw error;
            setProjects(data || []);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const deleteProject = async (id, e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!confirm(t('dashboard.deleteConfirm'))) return;
        await supabase.from('projects').delete().eq('id', id);
        setProjects(projects.filter(p => p.id !== id));
    };

    const formatBudget = (budget) => {
        if (budget >= 1000000) return `$${(budget / 1000000).toFixed(1)}M`;
        if (budget >= 1000) return `$${(budget / 1000).toFixed(0)}K`;
        return `$${budget}`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString(t === 'uk' ? 'uk-UA' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Get stats from projects
    const totalProjects = projects.length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const avgTeamSize = projects.length > 0
        ? Math.round(projects.reduce((sum, p) => sum + (p.team_size || 0), 0) / projects.length)
        : 0;
    const highComplexity = projects.filter(p => p.complexity === 'high' || p.complexity === 'critical').length;

    return (
        <Layout>
            {profile && (
                <div className="welcome-banner animate-in">
                    <span style={{ position: 'relative', zIndex: 1 }}>
                        👋 {t('dashboard.welcome', { name: profile.full_name || user?.email })}
                    </span>
                </div>
            )}

            {/* Stats Grid */}
            {!loading && projects.length > 0 && (
                <div className="stats-grid animate-in" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-card">
                        <div className="stat-card-icon purple">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <div className="stat-card-value">{totalProjects}</div>
                        <div className="stat-card-label">{t('dashboard.totalProjects') || 'Projects'}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon green">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                        <div className="stat-card-value">{formatBudget(totalBudget)}</div>
                        <div className="stat-card-label">{t('dashboard.totalBudget') || 'Total Budget'}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon blue">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <div className="stat-card-value">{avgTeamSize}</div>
                        <div className="stat-card-label">{t('dashboard.avgTeam') || 'Avg Team Size'}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon orange">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                        </div>
                        <div className="stat-card-value">{highComplexity}</div>
                        <div className="stat-card-label">{t('dashboard.highComplexity') || 'High Complexity'}</div>
                    </div>
                </div>
            )}

            <div className="page-header">
                <div className="toolbar">
                    <div>
                        <h1>{t('dashboard.title')}</h1>
                        <p>{t('dashboard.subtitle')}</p>
                    </div>
                    <Link to="/projects/new" className="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="8" y1="3" x2="8" y2="13" />
                            <line x1="3" y1="8" x2="13" y2="8" />
                        </svg>
                        {t('dashboard.newProject')}
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="loading-inline">
                    <div className="loading-spinner" />
                </div>
            ) : projects.length === 0 ? (
                <div className="empty-state">
                    <svg className="empty-state-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="8" y="8" width="48" height="48" rx="8" />
                        <line x1="24" y1="28" x2="40" y2="28" />
                        <line x1="24" y1="36" x2="36" y2="36" />
                        <line x1="24" y1="20" x2="40" y2="20" />
                    </svg>
                    <h3>{t('dashboard.noProjects')}</h3>
                    <p>{t('dashboard.noProjectsDesc')}</p>
                    <Link to="/projects/new" className="btn btn-primary">
                        {t('dashboard.newProject')}
                    </Link>
                </div>
            ) : (
                <div className="projects-grid">
                    {projects.map((project, i) => (
                        <div
                            key={project.id}
                            className="project-card animate-in"
                            style={{ animationDelay: `${0.05 * (i + 1)}s` }}
                            onClick={() => navigate(`/projects/${project.id}`)}
                        >
                            <div className="project-info">
                                <div className="project-name">{project.name}</div>
                                <div className="project-meta">
                                    <span className="project-meta-item">
                                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                            <circle cx="8" cy="5" r="3" />
                                            <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                                        </svg>
                                        {project.team_size} {t('common.people')}
                                    </span>
                                    <span className="project-meta-item">
                                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                            <line x1="8" y1="1" x2="8" y2="15" />
                                            <path d="M12 4H6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H4" />
                                        </svg>
                                        {formatBudget(project.budget)}
                                    </span>
                                    <span className="project-meta-item">
                                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                            <rect x="2" y="2" width="12" height="12" rx="2" />
                                            <line x1="2" y1="6" x2="14" y2="6" />
                                            <line x1="6" y1="2" x2="6" y2="6" />
                                        </svg>
                                        {project.duration_months} {t('common.months')}
                                    </span>
                                    <span className={`badge badge-${project.complexity}`}>
                                        {t(`project.complexityLevels.${project.complexity}`)}
                                    </span>
                                </div>
                            </div>
                            <div className="project-actions">
                                <button
                                    className="btn-icon btn-danger"
                                    onClick={(e) => deleteProject(project.id, e)}
                                    title={t('common.delete')}
                                >
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                        <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M4 4l1 9a1 1 0 001 1h4a1 1 0 001-1l1-9" />
                                    </svg>
                                </button>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'var(--color-text-tertiary)' }}>
                                    <path d="M6 4l4 4-4 4" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}
