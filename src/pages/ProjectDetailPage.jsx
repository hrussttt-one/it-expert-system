import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { runAnalysis } from '../lib/expertEngine';
import Layout from '../components/Layout';

export default function ProjectDetailPage() {
    const { t, i18n } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        const { data } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();
        setProject(data);

        // Check for saved analysis
        const { data: saved } = await supabase
            .from('analyses')
            .select('*')
            .eq('project_id', id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (saved?.result) {
            setAnalysis(typeof saved.result === 'string' ? JSON.parse(saved.result) : saved.result);
        }
        setLoading(false);
    };

    const handleAnalyze = async () => {
        if (!project) return;
        setAnalyzing(true);

        // Fetch knowledge base
        const [
            { data: knowledgeProjects },
            { data: strategies },
            { data: rules },
        ] = await Promise.all([
            supabase.from('knowledge_projects').select('*'),
            supabase.from('strategies').select('*'),
            supabase.from('strategy_rules').select('*'),
        ]);

        const result = await runAnalysis(
            project,
            knowledgeProjects || [],
            strategies || [],
            rules || [],
            i18n.language
        );

        // Enrich similar projects with strategy names
        const strategyMap = {};
        (strategies || []).forEach(s => { strategyMap[s.id] = s; });
        result.similarProjects = result.similarProjects.map(sp => ({
            ...sp,
            strategyName: strategyMap[sp.strategy_id]?.name || '',
        }));

        // Save analysis
        await supabase.from('analyses').insert({
            project_id: project.id,
            result,
        });

        setAnalysis(result);
        setAnalyzing(false);
    };

    const formatBudget = (v) => {
        if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
        if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
        return `$${v}`;
    };

    if (loading) {
        return (
            <Layout>
                <div className="loading-inline"><div className="loading-spinner" /></div>
            </Layout>
        );
    }

    if (!project) {
        return (
            <Layout>
                <div className="empty-state">
                    <h3>{t('common.error')}</h3>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>
                        {t('analysis.back')}
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="page-header">
                <div className="toolbar">
                    <div>
                        <h1>{project.name}</h1>
                        <p>{t('analysis.subtitle')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary" onClick={() => navigate('/')}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                <path d="M12 8H4M4 8l4-4M4 8l4 4" />
                            </svg>
                            {t('analysis.back')}
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate(`/projects/${id}/forecast`)}>
                            📈 {t('project.forecast')}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleAnalyze}
                            disabled={analyzing}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" transform="scale(0.65) translate(1, 1)" />
                            </svg>
                            {analyzing ? t('analysis.analyzing') : (analysis ? t('analysis.reanalyze') : t('analysis.runAnalysis'))}
                        </button>
                    </div>
                </div>
            </div>

            {/* Project Parameters */}
            <div className="analysis-section animate-in">
                <div className="analysis-section-title">{t('analysis.parameters')}</div>
                <div className="card">
                    {project.description && (
                        <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                            {project.description}
                        </p>
                    )}
                    <div className="params-grid">
                        <div className="param-item">
                            <span className="param-label">{t('project.teamSize')}</span>
                            <span className="param-value">{project.team_size}</span>
                        </div>
                        <div className="param-item">
                            <span className="param-label">{t('project.budget')}</span>
                            <span className="param-value">{formatBudget(project.budget)}</span>
                        </div>
                        <div className="param-item">
                            <span className="param-label">{t('project.duration')}</span>
                            <span className="param-value">{project.duration_months} {t('common.months')}</span>
                        </div>
                        <div className="param-item">
                            <span className="param-label">{t('project.complexity')}</span>
                            <span className="param-value">
                                <span className={`badge badge-${project.complexity}`}>
                                    {t(`project.complexityLevels.${project.complexity}`)}
                                </span>
                            </span>
                        </div>
                        <div className="param-item">
                            <span className="param-label">{t('project.projectType')}</span>
                            <span className="param-value">{t(`project.types.${project.project_type}`)}</span>
                        </div>
                        <div className="param-item">
                            <span className="param-label">{t('project.riskLevel')}</span>
                            <span className="param-value">
                                <span className={`badge badge-${project.risk_level}`}>
                                    {t(`project.riskLevels.${project.risk_level}`)}
                                </span>
                            </span>
                        </div>
                        <div className="param-item">
                            <span className="param-label">{t('project.teamExperience')}</span>
                            <span className="param-value">{t(`project.experienceLevels.${project.team_experience}`)}</span>
                        </div>
                        <div className="param-item">
                            <span className="param-label">{t('project.clientInvolvement')}</span>
                            <span className="param-value">{t(`project.clientLevels.${project.client_involvement}`)}</span>
                        </div>
                        <div className="param-item">
                            <span className="param-label">{t('project.requirementsStability')}</span>
                            <span className="param-value">{t(`project.stabilityLevels.${project.requirements_stability}`)}</span>
                        </div>
                        <div className="param-item">
                            <span className="param-label">{t('project.techStackNovelty')}</span>
                            <span className="param-value">{t(`project.noveltyLevels.${project.tech_stack_novelty}`)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {!analysis && !analyzing && (
                <div className="no-analysis animate-in">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary-light)', marginBottom: 16 }}>
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                    <p>{t('analysis.noAnalysis')}</p>
                    <button className="btn btn-primary btn-lg" onClick={handleAnalyze}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                        {t('analysis.runAnalysis')}
                    </button>
                </div>
            )}

            {analyzing && (
                <div className="loading-inline">
                    <div className="loading-spinner" />
                </div>
            )}

            {analysis && !analyzing && (
                <>
                    {/* Key Decision Factors */}
                    {analysis.keyFactors?.length > 0 && (
                        <div className="analysis-section animate-in">
                            <div className="analysis-section-title">{t('analysis.keyFactors')}</div>
                            <div className="key-factors">
                                {analysis.keyFactors.map((f, i) => (
                                    <span key={i} className="key-factor">{f}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommended Strategies */}
                    <div className="analysis-section animate-in">
                        <div className="analysis-section-title">{t('analysis.recommended')}</div>
                        {analysis.strategies?.filter(s => s.matchScore > 0).map((strategy, idx) => (
                            <div
                                key={strategy.id}
                                className={`strategy-card animate-in ${idx === 0 ? 'best-match' : ''}`}
                                style={{ animationDelay: `${0.1 * idx}s` }}
                            >
                                <div className="strategy-header">
                                    <div>
                                        <div className="strategy-name">
                                            {idx === 0 && (
                                                <span
                                                    className="badge badge-medium"
                                                    style={{ marginRight: 8, fontSize: '0.625rem' }}
                                                >
                                                    ⭐ {t('analysis.bestMatch')}
                                                </span>
                                            )}
                                            {strategy.name}
                                        </div>
                                    </div>
                                    <div className="strategy-score">{strategy.matchScore}%</div>
                                </div>

                                <div className="strategy-description">
                                    {typeof strategy.description === 'object'
                                        ? strategy.description[i18n.language] || strategy.description.uk
                                        : strategy.description}
                                </div>

                                {/* Strategy Metrics */}
                                <div className="strategy-details">
                                    <div className="strategy-detail">
                                        <div className="strategy-detail-label">{t('analysis.successRate')}</div>
                                        <div className="strategy-detail-value">
                                            {strategy.scenarios?.realistic?.successRate}%
                                        </div>
                                        <div className="progress-bar" style={{ marginTop: 8 }}>
                                            <div
                                                className={`progress-fill ${strategy.scenarios?.realistic?.successRate >= 70 ? 'success' :
                                                    strategy.scenarios?.realistic?.successRate >= 40 ? 'warning' : 'danger'
                                                    }`}
                                                style={{ width: `${strategy.scenarios?.realistic?.successRate}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="strategy-detail">
                                        <div className="strategy-detail-label">{t('analysis.budgetImpact')}</div>
                                        <div className="strategy-detail-value">
                                            {strategy.scenarios?.realistic?.budgetVariance > 0 ? '+' : ''}
                                            {strategy.scenarios?.realistic?.budgetVariance}%
                                        </div>
                                    </div>
                                    <div className="strategy-detail">
                                        <div className="strategy-detail-label">{t('analysis.timeline')}</div>
                                        <div className="strategy-detail-value">
                                            {strategy.scenarios?.realistic?.timeVariance > 0 ? '+' : ''}
                                            {strategy.scenarios?.realistic?.timeVariance}%
                                        </div>
                                    </div>
                                </div>

                                {/* Scenarios */}
                                <div className="scenarios-grid">
                                    {['optimistic', 'realistic', 'pessimistic'].map(scenario => (
                                        <div key={scenario} className={`scenario-card ${scenario}`}>
                                            <div className="scenario-label">{t(`analysis.${scenario}`)}</div>
                                            <div className="scenario-value">
                                                {strategy.scenarios?.[scenario]?.successRate}%
                                            </div>
                                            <div className="scenario-desc">
                                                {strategy.scenarios?.[scenario]?.description?.[i18n.language] ||
                                                    strategy.scenarios?.[scenario]?.description?.uk}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Reasoning */}
                                {strategy.reasoning?.length > 0 && (
                                    <div style={{ marginTop: 20 }}>
                                        <div className="strategy-detail-label" style={{ marginBottom: 10 }}>
                                            {t('analysis.reasoning')}
                                        </div>
                                        <ul style={{
                                            fontSize: '0.875rem',
                                            color: 'var(--color-text-secondary)',
                                            paddingLeft: 18,
                                            listStyle: 'disc',
                                            lineHeight: 1.7,
                                        }}>
                                            {strategy.reasoning.map((r, i) => (
                                                <li key={i} style={{ marginBottom: 4 }}>{r}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Similar Projects */}
                    {analysis.similarProjects?.length > 0 && (
                        <div className="analysis-section animate-in">
                            <div className="analysis-section-title">{t('analysis.similarProjects')}</div>
                            {analysis.similarProjects.map(sp => (
                                <div key={sp.id} className="similar-project">
                                    <div className="similar-project-info">
                                        <h4>{sp.name}</h4>
                                        <p>
                                            {t('analysis.strategy')}: {sp.strategyName} · {t('analysis.outcome')}: {sp.outcome}
                                        </p>
                                    </div>
                                    <div className="similarity-score">{sp.similarity}%</div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </Layout>
    );
}
