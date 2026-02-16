import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { runForecast } from '../services/forecastService';

export default function ForecastPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);

    // Forecast controls
    const [metric, setMetric] = useState('spend');
    const [scenario, setScenario] = useState('realistic');
    const [model, setModel] = useState('ema');
    const [autoMode, setAutoMode] = useState(true);
    const [k, setK] = useState(4);
    const [alpha, setAlpha] = useState(0.3);
    const [beta, setBeta] = useState(0.1);
    const [horizon, setHorizon] = useState(4);

    // Results
    const [results, setResults] = useState(null);
    const [savedRuns, setSavedRuns] = useState([]);

    useEffect(() => {
        fetchProject();
        fetchSavedRuns();
    }, [id]);

    async function fetchProject() {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data.user_id !== user?.id) {
                navigate('/');
                return;
            }

            setProject(data);
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchSavedRuns() {
        try {
            const { data, error } = await supabase
                .from('forecast_runs')
                .select('*')
                .eq('project_id', id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) {
                // Table might not exist yet - ignore error
                console.log('Forecast runs table not available yet');
                setSavedRuns([]);
                return;
            }
            setSavedRuns(data || []);
        } catch (error) {
            console.log('Forecast runs not available:', error);
            setSavedRuns([]);
        }
    }

    async function handleRunForecast() {
        if (!project) return;

        setRunning(true);
        try {
            // Prepare parameters
            let params;
            if (autoMode) {
                params = { auto: true };
            } else {
                if (model === 'sma') {
                    params = { k: parseInt(k) };
                } else if (model === 'ema') {
                    params = { alpha: parseFloat(alpha) };
                } else if (model === 'holt') {
                    params = { alpha: parseFloat(alpha), beta: parseFloat(beta) };
                }
            }

            // Run forecast
            const forecastResults = runForecast(
                project,
                metric,
                scenario,
                model,
                params,
                parseInt(horizon)
            );

            setResults(forecastResults);

            // Try to save to database (optional - won't fail if table doesn't exist)
            try {
                await supabase
                    .from('forecast_runs')
                    .insert({
                        project_id: id,
                        metric,
                        scenario,
                        model,
                        params: forecastResults.params,
                        horizon: forecastResults.horizon,
                        mae: forecastResults.mae,
                        mape: forecastResults.mape,
                        result_json: forecastResults
                    });

                // Refresh saved runs only if save succeeded
                await fetchSavedRuns();
            } catch (dbError) {
                // Database save failed - that's okay, continue without it
                console.log('Could not save forecast run (database table may not exist yet)');
            }

        } catch (error) {
            console.error('Error running forecast:', error);
            alert(t('forecast.error') + ': ' + error.message);
        } finally {
            setRunning(false);
        }
    }

    function getMetricUnit(metric) {
        switch (metric) {
            case 'spend': return '$/week';
            case 'velocity': return 'SP/week';
            case 'bugs': return 'bugs';
            default: return '';
        }
    }

    function getPMInsights() {
        if (!results || !project) return null;

        const insights = [];

        if (metric === 'spend') {
            // Calculate total forecasted spend
            const totalActual = results.baseline.reduce((a, b) => a + b, 0);
            const overrun = ((totalActual - project.budget) / project.budget) * 100;

            insights.push({
                type: overrun > 10 ? 'warning' : overrun > 0 ? 'info' : 'success',
                title: t('forecast.insights.budgetOverrun'),
                value: `${overrun > 0 ? '+' : ''}${overrun.toFixed(1)}%`,
                description: overrun > 10
                    ? t('forecast.insights.highOverrun')
                    : overrun > 0
                        ? t('forecast.insights.moderateOverrun')
                        : t('forecast.insights.onBudget')
            });
        }

        if (metric === 'velocity') {
            // Calculate ETA index (relative to planned duration)
            const avgVelocity = results.baseline.reduce((a, b) => a + b, 0) / results.baseline.length;
            const lastVelocity = results.baseline[results.baseline.length - 1];
            const trend = ((lastVelocity - avgVelocity) / avgVelocity) * 100;

            insights.push({
                type: trend < -10 ? 'warning' : trend > 10 ? 'success' : 'info',
                title: t('forecast.insights.velocityTrend'),
                value: `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`,
                description: trend < -10
                    ? t('forecast.insights.decliningVelocity')
                    : trend > 10
                        ? t('forecast.insights.improvingVelocity')
                        : t('forecast.insights.stableVelocity')
            });
        }

        if (metric === 'bugs') {
            // Check if bugs are trending up or down
            const firstHalf = results.baseline.slice(0, Math.floor(results.baseline.length / 2));
            const secondHalf = results.baseline.slice(Math.floor(results.baseline.length / 2));
            const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
            const bugTrend = ((avgSecond - avgFirst) / avgFirst) * 100;

            insights.push({
                type: bugTrend > 20 ? 'warning' : bugTrend < -20 ? 'success' : 'info',
                title: t('forecast.insights.qualityRisk'),
                value: `${bugTrend > 0 ? '+' : ''}${bugTrend.toFixed(1)}%`,
                description: bugTrend > 20
                    ? t('forecast.insights.highQualityRisk')
                    : bugTrend < -20
                        ? t('forecast.insights.improvingQuality')
                        : t('forecast.insights.stableQuality')
            });
        }

        return insights;
    }

    if (loading) {
        return (
            <Layout>
                <div className="loading-inline">
                    <div className="loading-spinner" />
                </div>
            </Layout>
        );
    }

    if (!project) {
        return (
            <Layout>
                <div className="empty-state">
                    <h3>{t('forecast.projectNotFound')}</h3>
                </div>
            </Layout>
        );
    }

    const insights = results ? getPMInsights() : null;

    return (
        <Layout>
            <div className="page-header">
                <div className="toolbar">
                    <div>
                        <h1>📈 {t('forecast.title')}</h1>
                        <p>{project.name}</p>
                    </div>
                    <button onClick={() => navigate(`/projects/${id}`)} className="btn btn-secondary">
                        ← {t('common.back')}
                    </button>
                </div>
            </div>

            <div className="forecast-container">
                {/* Controls */}
                <div className="card forecast-controls">
                    <h3>{t('forecast.controls')}</h3>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">{t('forecast.metric')}</label>
                            <select value={metric} onChange={(e) => setMetric(e.target.value)} className="form-select">
                                <option value="spend">{t('forecast.metrics.spend')}</option>
                                <option value="velocity">{t('forecast.metrics.velocity')}</option>
                                <option value="bugs">{t('forecast.metrics.bugs')}</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('forecast.scenario')}</label>
                            <select value={scenario} onChange={(e) => setScenario(e.target.value)} className="form-select">
                                <option value="optimistic">{t('forecast.scenarios.optimistic')}</option>
                                <option value="realistic">{t('forecast.scenarios.realistic')}</option>
                                <option value="pessimistic">{t('forecast.scenarios.pessimistic')}</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('forecast.model')}</label>
                            <select value={model} onChange={(e) => setModel(e.target.value)} className="form-select">
                                <option value="sma">{t('forecast.models.sma')}</option>
                                <option value="ema">{t('forecast.models.ema')}</option>
                                <option value="holt">{t('forecast.models.holt')}</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('forecast.horizon')}</label>
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={horizon}
                                onChange={(e) => setHorizon(e.target.value)}
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Parameters */}
                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={autoMode}
                                onChange={(e) => setAutoMode(e.target.checked)}
                            />
                            {t('forecast.autoMode')}
                        </label>
                    </div>

                    {!autoMode && (
                        <div className="form-grid">
                            {model === 'sma' && (
                                <div className="form-group">
                                    <label className="form-label">{t('forecast.params.k')}</label>
                                    <input
                                        type="number"
                                        min="2"
                                        max="10"
                                        value={k}
                                        onChange={(e) => setK(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                            )}
                            {(model === 'ema' || model === 'holt') && (
                                <div className="form-group">
                                    <label className="form-label">{t('forecast.params.alpha')}</label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        max="0.99"
                                        step="0.01"
                                        value={alpha}
                                        onChange={(e) => setAlpha(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                            )}
                            {model === 'holt' && (
                                <div className="form-group">
                                    <label className="form-label">{t('forecast.params.beta')}</label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        max="0.99"
                                        step="0.01"
                                        value={beta}
                                        onChange={(e) => setBeta(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleRunForecast}
                        disabled={running}
                        className="btn btn-primary"
                        style={{ marginTop: '1rem' }}
                    >
                        {running ? t('forecast.running') : t('forecast.runForecast')}
                    </button>
                </div>

                {/* Results */}
                {results && (
                    <>
                        {/* Metrics Summary */}
                        <div className="forecast-metrics">
                            <div className="metric-card">
                                <div className="metric-label">{t('forecast.mae')}</div>
                                <div className="metric-value">{results.mae.toFixed(2)}</div>
                                <div className="metric-unit">{getMetricUnit(metric)}</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-label">{t('forecast.mape')}</div>
                                <div className="metric-value">{results.mape.toFixed(2)}%</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-label">{t('forecast.parameters')}</div>
                                <div className="metric-value" style={{ fontSize: '0.9rem' }}>
                                    {JSON.stringify(results.params)}
                                </div>
                            </div>
                        </div>

                        {/* PM Insights */}
                        {insights && insights.length > 0 && (
                            <div className="forecast-insights">
                                <h3>{t('forecast.insights.title')}</h3>
                                {insights.map((insight, idx) => (
                                    <div key={idx} className={`insight-card insight-${insight.type}`}>
                                        <div className="insight-header">
                                            <span className="insight-title">{insight.title}</span>
                                            <span className="insight-value">{insight.value}</span>
                                        </div>
                                        <p className="insight-description">{insight.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Results Table */}
                        <div className="card">
                            <h3>{t('forecast.results')}</h3>
                            <p className="text-secondary">
                                {t('forecast.analyzing')}: <strong>{t(`forecast.metrics.${metric}`)}</strong> ({getMetricUnit(metric)})
                                <br />
                                {t('forecast.scenario')}: <strong>{t(`forecast.scenarios.${scenario}`)}</strong>
                                <br />
                                {t('forecast.model')}: <strong>{t(`forecast.models.${model}`)}</strong>
                            </p>

                            {/* Summary Statistics */}
                            <div className="forecast-summary">
                                <div className="summary-item">
                                    <span className="summary-label">Загальна кількість тижнів:</span>
                                    <span className="summary-value">{results.baseline.length}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Середнє значення:</span>
                                    <span className="summary-value">
                                        {(results.baseline.reduce((a, b) => a + b, 0) / results.baseline.length).toFixed(2)} {getMetricUnit(metric)}
                                    </span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Мін / Макс:</span>
                                    <span className="summary-value">
                                        {Math.min(...results.baseline).toFixed(2)} / {Math.max(...results.baseline).toFixed(2)}
                                    </span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Прогноз на наступні {results.horizon} тижні:</span>
                                    <span className="summary-value forecast-highlight">
                                        {results.futureForecasts[0].toFixed(2)} {getMetricUnit(metric)}
                                    </span>
                                </div>
                            </div>

                            {/* Last 20 rows + future forecasts */}
                            {/* Last 20 rows + future forecasts */}
                            <div className="table-container">
                                <table className="forecast-table">
                                    <thead>
                                        <tr>
                                            <th>{t('forecast.table.week')}</th>
                                            <th>{t('forecast.table.actual')}</th>
                                            <th>{t('forecast.table.smoothed')}</th>
                                            <th>{t('forecast.table.forecast')}</th>
                                            <th>{t('forecast.table.error')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Last 20 rows */}
                                        {results.baseline.slice(-20).map((actual, relIdx) => {
                                            const idx = results.baseline.length - 20 + relIdx;
                                            return (
                                                <tr key={idx}>
                                                    <td>{idx + 1}</td>
                                                    <td>{actual.toFixed(2)}</td>
                                                    <td>{results.smoothed[idx] != null ? results.smoothed[idx].toFixed(2) : '-'}</td>
                                                    <td>{results.forecast[idx] != null ? results.forecast[idx].toFixed(2) : '-'}</td>
                                                    <td>{results.errors[idx] != null ? results.errors[idx].toFixed(2) : '-'}</td>
                                                </tr>
                                            );
                                        })}
                                        {/* Future forecasts */}
                                        {results.futureForecasts.map((forecast, idx) => (
                                            <tr key={`future-${idx}`} className="future-row">
                                                <td>{results.baseline.length + idx + 1}</td>
                                                <td>-</td>
                                                <td>-</td>
                                                <td className="forecast-future">{forecast.toFixed(2)}</td>
                                                <td>-</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-secondary" style={{ marginTop: '0.5rem', fontSize: '0.8rem', textAlign: 'center' }}>
                                {t('common.scrollForMore') || 'Прокрутіть таблицю вправо →'}
                            </p>
                        </div>

                        {/* Formulas */}
                        <div className="card formula-display">
                            <h3>{t('forecast.formulas')}</h3>
                            {model === 'sma' && (
                                <div>
                                    <p><strong>{t('forecast.models.sma')}:</strong></p>
                                    <code>s_t = (1/k) × Σ(y_(t-i)) for i=0 to k-1</code>
                                    <p className="text-secondary">{t('forecast.formulaDesc.sma')}</p>
                                </div>
                            )}
                            {model === 'ema' && (
                                <div>
                                    <p><strong>{t('forecast.models.ema')}:</strong></p>
                                    <code>s_t = α × y_t + (1-α) × s_(t-1)</code>
                                    <p className="text-secondary">{t('forecast.formulaDesc.ema')}</p>
                                </div>
                            )}
                            {model === 'holt' && (
                                <div>
                                    <p><strong>{t('forecast.models.holt')}:</strong></p>
                                    <code>l_t = α × y_t + (1-α) × (l_(t-1) + b_(t-1))</code>
                                    <br />
                                    <code>b_t = β × (l_t - l_(t-1)) + (1-β) × b_(t-1)</code>
                                    <br />
                                    <code>ŷ_(t+h) = l_t + h × b_t</code>
                                    <p className="text-secondary">{t('forecast.formulaDesc.holt')}</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Saved Runs */}
                {savedRuns.length > 0 && (
                    <div className="card" style={{ marginTop: '2rem' }}>
                        <h3>{t('forecast.savedRuns')}</h3>
                        <div className="saved-runs-list">
                            {savedRuns.map((run) => (
                                <div key={run.id} className="saved-run-item">
                                    <div>
                                        <strong>{t(`forecast.metrics.${run.metric}`)}</strong> - {t(`forecast.models.${run.model}`)}
                                        <br />
                                        <span className="text-secondary">
                                            {new Date(run.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="saved-run-metrics">
                                        <span>MAE: {run.mae?.toFixed(2)}</span>
                                        <span>MAPE: {run.mape?.toFixed(2)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
