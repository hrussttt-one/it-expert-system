import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';

export default function NewProjectPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        team_size: 5,
        budget: 50000,
        duration_months: 6,
        complexity: 'medium',
        project_type: 'development',
        risk_level: 'medium',
        team_experience: 'mixed',
        client_involvement: 'moderate',
        requirements_stability: 'evolving',
        tech_stack_novelty: 'moderate',
    });

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const { data, error } = await supabase
            .from('projects')
            .insert({
                ...form,
                user_id: user.id,
                team_size: parseInt(form.team_size),
                budget: parseFloat(form.budget),
                duration_months: parseInt(form.duration_months),
            })
            .select()
            .single();

        if (!error && data) {
            navigate(`/projects/${data.id}`);
        }
        setSaving(false);
    };

    return (
        <Layout>
            <div className="page-header">
                <h1>{t('project.title')}</h1>
                <p>{t('project.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card animate-in">
                    <div className="form-group">
                        <label className="form-label">{t('project.name')}</label>
                        <input
                            type="text"
                            className="form-input"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder={t('project.namePlaceholder')}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('project.description')}</label>
                        <textarea
                            className="form-textarea"
                            value={form.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder={t('project.descriptionPlaceholder')}
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">{t('project.teamSize')}</label>
                            <input
                                type="number"
                                className="form-input"
                                value={form.team_size}
                                onChange={(e) => handleChange('team_size', e.target.value)}
                                min="1"
                                max="500"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('project.budget')}</label>
                            <input
                                type="number"
                                className="form-input"
                                value={form.budget}
                                onChange={(e) => handleChange('budget', e.target.value)}
                                min="1000"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('project.duration')}</label>
                            <input
                                type="number"
                                className="form-input"
                                value={form.duration_months}
                                onChange={(e) => handleChange('duration_months', e.target.value)}
                                min="1"
                                max="60"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('project.complexity')}</label>
                            <select
                                className="form-select"
                                value={form.complexity}
                                onChange={(e) => handleChange('complexity', e.target.value)}
                            >
                                {['low', 'medium', 'high', 'critical'].map(v => (
                                    <option key={v} value={v}>{t(`project.complexityLevels.${v}`)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('project.projectType')}</label>
                            <select
                                className="form-select"
                                value={form.project_type}
                                onChange={(e) => handleChange('project_type', e.target.value)}
                            >
                                {['development', 'support', 'migration', 'integration', 'research'].map(v => (
                                    <option key={v} value={v}>{t(`project.types.${v}`)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('project.riskLevel')}</label>
                            <select
                                className="form-select"
                                value={form.risk_level}
                                onChange={(e) => handleChange('risk_level', e.target.value)}
                            >
                                {['low', 'medium', 'high', 'critical'].map(v => (
                                    <option key={v} value={v}>{t(`project.riskLevels.${v}`)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('project.teamExperience')}</label>
                            <select
                                className="form-select"
                                value={form.team_experience}
                                onChange={(e) => handleChange('team_experience', e.target.value)}
                            >
                                {['junior', 'mixed', 'senior', 'expert'].map(v => (
                                    <option key={v} value={v}>{t(`project.experienceLevels.${v}`)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('project.clientInvolvement')}</label>
                            <select
                                className="form-select"
                                value={form.client_involvement}
                                onChange={(e) => handleChange('client_involvement', e.target.value)}
                            >
                                {['minimal', 'moderate', 'active', 'embedded'].map(v => (
                                    <option key={v} value={v}>{t(`project.clientLevels.${v}`)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('project.requirementsStability')}</label>
                            <select
                                className="form-select"
                                value={form.requirements_stability}
                                onChange={(e) => handleChange('requirements_stability', e.target.value)}
                            >
                                {['stable', 'evolving', 'volatile'].map(v => (
                                    <option key={v} value={v}>{t(`project.stabilityLevels.${v}`)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('project.techStackNovelty')}</label>
                            <select
                                className="form-select"
                                value={form.tech_stack_novelty}
                                onChange={(e) => handleChange('tech_stack_novelty', e.target.value)}
                            >
                                {['established', 'moderate', 'cutting_edge'].map(v => (
                                    <option key={v} value={v}>{t(`project.noveltyLevels.${v}`)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
                            {t('project.cancel')}
                        </button>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                            {saving ? t('project.saving') : t('project.save')}
                        </button>
                    </div>
                </div>
            </form>
        </Layout>
    );
}
