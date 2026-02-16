import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';

export default function GuidePage() {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    return (
        <Layout>
            <div className="guide-page animate-in">
                <h1 className="page-title">{t('guide.title')}</h1>
                <p className="page-subtitle">{t('guide.subtitle')}</p>

                {/* Section 1: Creating a new project */}
                <section className="guide-section animate-in" style={{ animationDelay: '0.1s' }}>
                    <div className="guide-section-number">1</div>
                    <h2 className="guide-section-title">{t('guide.createProject.title')}</h2>
                    <p className="guide-text">{t('guide.createProject.intro')}</p>

                    <div className="guide-steps">
                        <div className="guide-step">
                            <div className="guide-step-badge">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="3" x2="8" y2="13" /><line x1="3" y1="8" x2="13" y2="8" /></svg>
                            </div>
                            <div>
                                <strong>{t('guide.createProject.step1Title')}</strong>
                                <p>{t('guide.createProject.step1')}</p>
                            </div>
                        </div>
                        <div className="guide-step">
                            <div className="guide-step-badge">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2h12v12H2z" /><path d="M5 6h6M5 8h6M5 10h4" /></svg>
                            </div>
                            <div>
                                <strong>{t('guide.createProject.step2Title')}</strong>
                                <p>{t('guide.createProject.step2')}</p>
                            </div>
                        </div>
                        <div className="guide-step">
                            <div className="guide-step-badge">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l4 4 6-8" /></svg>
                            </div>
                            <div>
                                <strong>{t('guide.createProject.step3Title')}</strong>
                                <p>{t('guide.createProject.step3')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="guide-screenshot">
                        <img src="/guide/new-project-form.png" alt={t('guide.createProject.screenshotAlt')} />
                        <span className="guide-screenshot-caption">{t('guide.createProject.screenshotCaption')}</span>
                    </div>
                </section>

                {/* Section 2: Data used for analysis */}
                <section className="guide-section animate-in" style={{ animationDelay: '0.2s' }}>
                    <div className="guide-section-number">2</div>
                    <h2 className="guide-section-title">{t('guide.dataUsed.title')}</h2>
                    <p className="guide-text">{t('guide.dataUsed.intro')}</p>

                    <div className="guide-params-grid">
                        {[
                            { icon: '👥', key: 'teamSize' },
                            { icon: '💰', key: 'budget' },
                            { icon: '📅', key: 'duration' },
                            { icon: '⚡', key: 'complexity' },
                            { icon: '🏷️', key: 'projectType' },
                            { icon: '🎯', key: 'riskLevel' },
                            { icon: '🧑‍💻', key: 'teamExp' },
                            { icon: '🤝', key: 'clientInv' },
                            { icon: '📋', key: 'reqStability' },
                            { icon: '🔬', key: 'techNovelty' },
                        ].map(p => (
                            <div key={p.key} className="guide-param-card">
                                <span className="guide-param-icon">{p.icon}</span>
                                <div>
                                    <strong>{t(`guide.dataUsed.params.${p.key}.name`)}</strong>
                                    <p>{t(`guide.dataUsed.params.${p.key}.desc`)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="guide-info-box">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="8" /><line x1="9" y1="8" x2="9" y2="13" /><circle cx="9" cy="5.5" r="0.5" fill="var(--primary)" /></svg>
                        <p>{t('guide.dataUsed.weights')}</p>
                    </div>
                </section>

                {/* Section 3: How analysis works */}
                <section className="guide-section animate-in" style={{ animationDelay: '0.3s' }}>
                    <div className="guide-section-number">3</div>
                    <h2 className="guide-section-title">{t('guide.howAnalysis.title')}</h2>
                    <p className="guide-text">{t('guide.howAnalysis.intro')}</p>

                    <div className="guide-mechanisms">
                        <div className="guide-mechanism-card">
                            <div className="guide-mechanism-icon rule-based">
                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h16v4H3z" /><path d="M5 11h12" /><path d="M5 15h8" /><path d="M5 19h4" /></svg>
                            </div>
                            <h3>{t('guide.howAnalysis.ruleBased.title')}</h3>
                            <p>{t('guide.howAnalysis.ruleBased.desc')}</p>
                            <div className="guide-mechanism-weight">50%</div>
                        </div>
                        <div className="guide-mechanism-card">
                            <div className="guide-mechanism-icon case-based">
                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="9" /><path d="M11 2a9 9 0 010 18" fill="currentColor" opacity="0.15" /><path d="M7 11l3 3 5-5" /></svg>
                            </div>
                            <h3>{t('guide.howAnalysis.caseBased.title')}</h3>
                            <p>{t('guide.howAnalysis.caseBased.desc')}</p>
                            <div className="guide-mechanism-weight">40%</div>
                        </div>
                        <div className="guide-mechanism-card">
                            <div className="guide-mechanism-icon scenario">
                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l4-6 4 4 4-8 4 6" /><path d="M3 19h16" /></svg>
                            </div>
                            <h3>{t('guide.howAnalysis.scenario.title')}</h3>
                            <p>{t('guide.howAnalysis.scenario.desc')}</p>
                            <div className="guide-mechanism-weight">+10%</div>
                        </div>
                    </div>

                    <div className="guide-screenshot">
                        <img src="/guide/project-detail.png" alt={t('guide.howAnalysis.screenshotAlt')} />
                        <span className="guide-screenshot-caption">{t('guide.howAnalysis.screenshotCaption')}</span>
                    </div>
                </section>

                {/* Section 4: How the response is formed */}
                <section className="guide-section animate-in" style={{ animationDelay: '0.4s' }}>
                    <div className="guide-section-number">4</div>
                    <h2 className="guide-section-title">{t('guide.responseFormed.title')}</h2>
                    <p className="guide-text">{t('guide.responseFormed.intro')}</p>

                    <div className="guide-response-flow">
                        <div className="guide-flow-step">
                            <div className="guide-flow-number">1</div>
                            <div>
                                <strong>{t('guide.responseFormed.step1Title')}</strong>
                                <p>{t('guide.responseFormed.step1')}</p>
                            </div>
                        </div>
                        <div className="guide-flow-connector" />
                        <div className="guide-flow-step">
                            <div className="guide-flow-number">2</div>
                            <div>
                                <strong>{t('guide.responseFormed.step2Title')}</strong>
                                <p>{t('guide.responseFormed.step2')}</p>
                            </div>
                        </div>
                        <div className="guide-flow-connector" />
                        <div className="guide-flow-step">
                            <div className="guide-flow-number">3</div>
                            <div>
                                <strong>{t('guide.responseFormed.step3Title')}</strong>
                                <p>{t('guide.responseFormed.step3')}</p>
                            </div>
                        </div>
                        <div className="guide-flow-connector" />
                        <div className="guide-flow-step">
                            <div className="guide-flow-number">4</div>
                            <div>
                                <strong>{t('guide.responseFormed.step4Title')}</strong>
                                <p>{t('guide.responseFormed.step4')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="guide-accuracy-box">
                        <h3>{t('guide.responseFormed.accuracyTitle')}</h3>
                        <p>{t('guide.responseFormed.accuracyDesc')}</p>
                        <div className="guide-accuracy-factors">
                            <div className="guide-accuracy-factor">
                                <span className="guide-accuracy-icon good">✓</span>
                                <span>{t('guide.responseFormed.accuracyGood')}</span>
                            </div>
                            <div className="guide-accuracy-factor">
                                <span className="guide-accuracy-icon good">✓</span>
                                <span>{t('guide.responseFormed.accuracyKB')}</span>
                            </div>
                            <div className="guide-accuracy-factor">
                                <span className="guide-accuracy-icon warn">!</span>
                                <span>{t('guide.responseFormed.accuracyWarn')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="guide-screenshot">
                        <img src="/guide/analysis-results.png" alt={t('guide.responseFormed.screenshotAlt')} />
                        <span className="guide-screenshot-caption">{t('guide.responseFormed.screenshotCaption')}</span>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
