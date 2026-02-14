/**
 * Expert System Engine for IT Project Management
 * 
 * Three inference mechanisms:
 * 1. Rule-Based Inference — evaluates strategy rules against project parameters
 * 2. Case-Based Reasoning — finds similar projects in knowledge base
 * 3. Scenario Analysis — models optimistic/realistic/pessimistic outcomes
 */

// Numeric scale mappings for categorical values
const SCALES = {
    complexity: { low: 1, medium: 2, high: 3, critical: 4 },
    risk_level: { low: 1, medium: 2, high: 3, critical: 4 },
    team_experience: { junior: 1, mixed: 2, senior: 3, expert: 4 },
    client_involvement: { minimal: 1, moderate: 2, active: 3, embedded: 4 },
    requirements_stability: { stable: 3, evolving: 2, volatile: 1 },
    tech_stack_novelty: { established: 1, moderate: 2, cutting_edge: 3 },
    project_type: { support: 1, migration: 2, development: 3, integration: 4, research: 5 },
};

// Weights for similarity calculation
const FEATURE_WEIGHTS = {
    team_size: 0.10,
    budget: 0.10,
    duration_months: 0.08,
    complexity: 0.15,
    project_type: 0.12,
    risk_level: 0.12,
    team_experience: 0.10,
    client_involvement: 0.08,
    requirements_stability: 0.08,
    tech_stack_novelty: 0.07,
};

/**
 * Normalize a numeric value to 0-1 range
 */
function normalize(value, min, max) {
    if (max === min) return 0.5;
    return (value - min) / (max - min);
}

/**
 * Get numeric value for a feature
 */
function getNumericValue(feature, value) {
    if (SCALES[feature]) {
        return SCALES[feature][value] || 0;
    }
    return parseFloat(value) || 0;
}

/**
 * Compute similarity between two projects (0.0 — 1.0)
 */
function computeSimilarity(project, reference, ranges) {
    let totalWeight = 0;
    let weightedSimilarity = 0;

    for (const [feature, weight] of Object.entries(FEATURE_WEIGHTS)) {
        const pVal = getNumericValue(feature, project[feature]);
        const rVal = getNumericValue(feature, reference[feature]);

        let pNorm, rNorm;
        if (SCALES[feature]) {
            const vals = Object.values(SCALES[feature]);
            const min = Math.min(...vals);
            const max = Math.max(...vals);
            pNorm = normalize(pVal, min, max);
            rNorm = normalize(rVal, min, max);
        } else {
            const { min, max } = ranges[feature] || { min: 0, max: 1 };
            pNorm = normalize(pVal, min, max);
            rNorm = normalize(rVal, min, max);
        }

        const dist = Math.abs(pNorm - rNorm);
        weightedSimilarity += weight * (1 - dist);
        totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSimilarity / totalWeight : 0;
}

/**
 * Rule-Based Inference
 * Each rule defines conditions and awards points to strategies
 */
function evaluateRules(project, rules) {
    const scores = {};

    for (const rule of rules) {
        let conditions;
        try {
            conditions = typeof rule.conditions === 'string'
                ? JSON.parse(rule.conditions)
                : rule.conditions;
        } catch {
            continue;
        }

        let match = true;
        for (const [field, condition] of Object.entries(conditions)) {
            const projectValue = project[field];
            if (projectValue === undefined) { match = false; break; }

            if (typeof condition === 'object' && condition !== null) {
                const numVal = typeof projectValue === 'number'
                    ? projectValue
                    : getNumericValue(field, projectValue);

                if (condition.min !== undefined && numVal < condition.min) { match = false; break; }
                if (condition.max !== undefined && numVal > condition.max) { match = false; break; }
                if (condition.eq !== undefined && projectValue !== condition.eq) { match = false; break; }
                if (condition.in && !condition.in.includes(projectValue)) { match = false; break; }
            } else {
                if (projectValue !== condition) { match = false; break; }
            }
        }

        if (match) {
            if (!scores[rule.strategy_id]) {
                scores[rule.strategy_id] = { points: 0, matchedRules: [] };
            }
            scores[rule.strategy_id].points += rule.weight || 1;
            scores[rule.strategy_id].matchedRules.push(rule);
        }
    }

    return scores;
}

/**
 * Case-Based Reasoning — find similar projects and extract their strategies
 */
function findSimilarProjects(project, knowledgeProjects) {
    // Compute ranges for numeric features
    const numericFeatures = ['team_size', 'budget', 'duration_months'];
    const ranges = {};
    for (const f of numericFeatures) {
        const values = knowledgeProjects.map(kp => parseFloat(kp[f]) || 0);
        values.push(parseFloat(project[f]) || 0);
        ranges[f] = { min: Math.min(...values), max: Math.max(...values) };
    }

    const results = knowledgeProjects.map(kp => ({
        ...kp,
        similarity: computeSimilarity(project, kp, ranges),
    }));

    return results.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Scenario Analysis — model 3 scenarios for a strategy
 */
function analyzeScenarios(project, strategy, similarity) {
    const complexity = SCALES.complexity[project.complexity] || 2;
    const risk = SCALES.risk_level[project.risk_level] || 2;
    const experience = SCALES.team_experience[project.team_experience] || 2;
    const stability = SCALES.requirements_stability[project.requirements_stability] || 2;

    const baseSuccessRate = similarity * 100;
    const riskPenalty = (risk - 1) * 5;
    const experienceBonus = (experience - 1) * 4;
    const stabilityBonus = (stability - 1) * 3;
    const complexityPenalty = (complexity - 1) * 4;

    const realisticSuccess = Math.min(98, Math.max(15,
        baseSuccessRate - riskPenalty + experienceBonus + stabilityBonus - complexityPenalty
    ));

    const budgetVariance = (complexity * 0.08 + risk * 0.06) * 100;
    const timeVariance = (complexity * 0.07 + (3 - stability) * 0.05) * 100;

    return {
        optimistic: {
            successRate: Math.min(99, realisticSuccess + 15),
            budgetVariance: -Math.round(budgetVariance * 0.3),
            timeVariance: -Math.round(timeVariance * 0.3),
            description: {
                en: 'Best case: experienced team, clear requirements, minimal risks materialize',
                uk: 'Найкращий випадок: досвідчена команда, чіткі вимоги, мінімальні ризики',
            },
        },
        realistic: {
            successRate: Math.round(realisticSuccess),
            budgetVariance: Math.round(budgetVariance * 0.5),
            timeVariance: Math.round(timeVariance * 0.5),
            description: {
                en: 'Expected case: typical challenges, moderate scope changes',
                uk: 'Очікуваний випадок: типові виклики, помірні зміни обсягу',
            },
        },
        pessimistic: {
            successRate: Math.max(10, realisticSuccess - 25),
            budgetVariance: Math.round(budgetVariance * 1.5),
            timeVariance: Math.round(timeVariance * 1.5),
            description: {
                en: 'Worst case: key risks materialize, significant scope creep',
                uk: 'Найгірший випадок: ключові ризики реалізуються, значне розширення обсягу',
            },
        },
    };
}

/**
 * Generate key decision factors based on project parameters
 */
function getKeyFactors(project, lang = 'uk') {
    const factors = [];
    const labels = {
        en: {
            highComplexity: 'High Complexity',
            criticalRisk: 'Critical Risk',
            juniorTeam: 'Junior Team',
            volatileReqs: 'Volatile Requirements',
            cuttingEdge: 'Cutting-Edge Tech',
            largeTeam: 'Large Team (>20)',
            longProject: 'Long Duration (>12mo)',
            highBudget: 'High Budget',
            activeClient: 'Active Client',
            stableReqs: 'Stable Requirements',
        },
        uk: {
            highComplexity: 'Висока складність',
            criticalRisk: 'Критичний ризик',
            juniorTeam: 'Молодша команда',
            volatileReqs: 'Нестабільні вимоги',
            cuttingEdge: 'Найновіші технології',
            largeTeam: 'Велика команда (>20)',
            longProject: 'Тривалий проєкт (>12 міс)',
            highBudget: 'Великий бюджет',
            activeClient: 'Активний клієнт',
            stableReqs: 'Стабільні вимоги',
        },
    };
    const l = labels[lang] || labels.uk;

    if (['high', 'critical'].includes(project.complexity)) factors.push(l.highComplexity);
    if (['high', 'critical'].includes(project.risk_level)) factors.push(l.criticalRisk);
    if (project.team_experience === 'junior') factors.push(l.juniorTeam);
    if (project.requirements_stability === 'volatile') factors.push(l.volatileReqs);
    if (project.tech_stack_novelty === 'cutting_edge') factors.push(l.cuttingEdge);
    if (project.team_size > 20) factors.push(l.largeTeam);
    if (project.duration_months > 12) factors.push(l.longProject);
    if (project.budget > 500000) factors.push(l.highBudget);
    if (['active', 'embedded'].includes(project.client_involvement)) factors.push(l.activeClient);
    if (project.requirements_stability === 'stable') factors.push(l.stableReqs);

    return factors;
}

/**
 * Main analysis function — combines all three mechanisms
 */
export async function runAnalysis(project, knowledgeProjects, strategies, rules, lang = 'uk') {
    // 1. Rule-Based Inference
    const ruleScores = evaluateRules(project, rules);

    // 2. Case-Based Reasoning
    const similarProjects = findSimilarProjects(project, knowledgeProjects);
    const topSimilar = similarProjects.slice(0, 5);

    // Aggregate CBR scores from similar projects
    const cbrScores = {};
    for (const sp of topSimilar) {
        if (sp.strategy_id) {
            if (!cbrScores[sp.strategy_id]) {
                cbrScores[sp.strategy_id] = { totalSim: 0, count: 0, successBonus: 0 };
            }
            cbrScores[sp.strategy_id].totalSim += sp.similarity;
            cbrScores[sp.strategy_id].count += 1;
            if (sp.outcome === 'success') {
                cbrScores[sp.strategy_id].successBonus += sp.similarity * 0.2;
            }
        }
    }

    // 3. Combine scores and build strategy results
    const strategyResults = strategies.map(strategy => {
        const ruleScore = ruleScores[strategy.id]?.points || 0;
        const matchedRules = ruleScores[strategy.id]?.matchedRules || [];
        const cbr = cbrScores[strategy.id] || { totalSim: 0, count: 0, successBonus: 0 };

        // Normalize scores to 0-100
        const maxRulePoints = Math.max(
            ...Object.values(ruleScores).map(s => s.points),
            1
        );
        const normalizedRuleScore = (ruleScore / maxRulePoints) * 50;
        const normalizedCBRScore = cbr.count > 0
            ? ((cbr.totalSim / cbr.count) * 40 + cbr.successBonus * 10)
            : 0;

        const totalScore = Math.min(99, Math.round(normalizedRuleScore + normalizedCBRScore));

        // Generate scenarios
        const scenarios = analyzeScenarios(project, strategy, totalScore / 100);

        // Build reasoning
        const reasonParts = [];
        if (matchedRules.length > 0) {
            const ruleDescs = matchedRules
                .map(r => (typeof r.description === 'object' ? r.description[lang] : r.description) || '')
                .filter(Boolean);
            reasonParts.push(...ruleDescs);
        }
        if (cbr.count > 0) {
            reasonParts.push(
                lang === 'uk'
                    ? `${cbr.count} подібних проєктів у базі знань використовували цю стратегію`
                    : `${cbr.count} similar projects in knowledge base used this strategy`
            );
        }

        return {
            ...strategy,
            matchScore: totalScore,
            scenarios,
            reasoning: reasonParts,
            matchedRulesCount: matchedRules.length,
            similarProjectsCount: cbr.count,
        };
    });

    // Sort by match score
    strategyResults.sort((a, b) => b.matchScore - a.matchScore);

    // Key decision factors
    const keyFactors = getKeyFactors(project, lang);

    return {
        strategies: strategyResults,
        similarProjects: topSimilar.map(sp => ({
            id: sp.id,
            name: sp.name,
            similarity: Math.round(sp.similarity * 100),
            strategy_id: sp.strategy_id,
            outcome: sp.outcome,
            description: sp.description,
        })),
        keyFactors,
    };
}
