import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';

export default function DashboardPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, [user]);

    const fetchProjects = async () => {
        if (!user) return;

        // Check if user is admin via profile
        // Note: Since RLS is disabled, we must manually filter for non-admins
        const { data: userProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        let query = supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (userProfile?.role !== 'admin') {
            query = query.eq('user_id', user.id);
        }

        const { data } = await query;
        setProjects(data || []);
        setLoading(false);
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

    return (
        <Layout>
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
                                        {formatBudget(project.budget)}
                                    </span>
                                    <span className="project-meta-item">
                                        {project.duration_months} {t('common.months')}
                                    </span>
                                    <span className={`badge badge-${project.complexity}`}>
                                        {t(`project.complexityLevels.${project.complexity}`)}
                                    </span>
                                </div>
                            </div>
                            <div className="project-actions">
                                <button
                                    className="btn btn-icon btn-danger"
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
