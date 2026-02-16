/**
 * Time Series Forecasting Service
 * Implements baseline generation, smoothing algorithms (SMA, EMA, Holt),
 * and adaptive parameter selection for project metrics forecasting.
 */

/**
 * Generate baseline time series from project parameters
 * @param {Object} project - Project data with parameters
 * @param {string} metric - 'spend', 'velocity', or 'bugs'
 * @param {string} scenario - 'optimistic', 'realistic', or 'pessimistic'
 * @returns {Array<number>} Time series data (weekly values)
 */
export function generateBaseline(project, metric, scenario = 'realistic') {
    const weeks = Math.ceil(project.duration_months * 4.33); // ~4.33 weeks per month
    const series = [];

    // Scenario multipliers
    const scenarioMultipliers = {
        optimistic: 0.9,
        realistic: 1.0,
        pessimistic: 1.15
    };
    const scenarioMult = scenarioMultipliers[scenario];

    // Risk level multipliers
    const riskMultipliers = {
        low: 0.95,
        medium: 1.0,
        high: 1.15,
        critical: 1.3
    };
    const riskMult = riskMultipliers[project.risk_level] || 1.0;

    // Complexity multipliers
    const complexityMultipliers = {
        low: 1.2,
        medium: 1.0,
        high: 0.8,
        critical: 0.6
    };
    const complexityMult = complexityMultipliers[project.complexity] || 1.0;

    // Experience multipliers
    const experienceMultipliers = {
        junior: 0.7,
        mid: 1.0,
        senior: 1.3,
        expert: 1.5
    };
    const expMult = experienceMultipliers[project.team_experience] || 1.0;

    // Stability trend
    const stabilityTrends = {
        stable: -0.3,
        moderate: 0,
        volatile: 0.5
    };
    const stabilityTrend = stabilityTrends[project.requirements_stability] || 0;

    // Helper: random noise
    const noise = (min, max) => min + Math.random() * (max - min);

    switch (metric) {
        case 'spend': {
            // Weekly Spend ($/week)
            const weeklyBudget = project.budget / weeks;
            const baseSpend = weeklyBudget * riskMult * scenarioMult;

            for (let t = 0; t < weeks; t++) {
                // Add wave pattern (spending often increases mid-project)
                const wave = 1 + 0.2 * Math.sin((t / weeks) * Math.PI);
                const value = baseSpend * wave * (1 + noise(-0.1, 0.1));
                series.push(Math.max(0, value));
            }
            break;
        }

        case 'velocity': {
            // Weekly Velocity (story points/week)
            const baseVelocity = project.team_size * 2 * expMult; // ~2 SP per person per week
            const adjustedVelocity = baseVelocity * complexityMult * scenarioMult;

            for (let t = 0; t < weeks; t++) {
                // Velocity typically improves slightly over time (learning curve)
                const learningCurve = 1 + (t / weeks) * 0.15;
                const value = adjustedVelocity * learningCurve * (1 + noise(-0.15, 0.15));
                series.push(Math.max(0, value));
            }
            break;
        }

        case 'bugs': {
            // Open Bugs (count)
            const complexityScore = { low: 2, medium: 5, high: 10, critical: 20 }[project.complexity] || 5;
            const riskScore = { low: 1, medium: 1.5, high: 2, critical: 3 }[project.risk_level] || 1.5;
            const baseBugs = complexityScore * riskScore * scenarioMult;

            for (let t = 0; t < weeks; t++) {
                // Bugs typically peak mid-project, then decrease if stable
                const lifecycle = baseBugs * (1 + Math.sin((t / weeks) * Math.PI));
                const trend = stabilityTrend * (t / weeks) * baseBugs;
                const value = lifecycle + trend + noise(-2, 2);
                series.push(Math.max(0, Math.round(value)));
            }
            break;
        }

        default:
            throw new Error(`Unknown metric: ${metric}`);
    }

    return series;
}

/**
 * Simple Moving Average (SMA)
 * @param {Array<number>} series - Time series data
 * @param {number} k - Window size
 * @returns {Object} { smoothed, forecast, errors }
 */
export function sma(series, k = 3) {
    const smoothed = [];
    const forecast = [];
    const errors = [];

    for (let t = 0; t < series.length; t++) {
        if (t < k - 1) {
            smoothed.push(null);
            forecast.push(null);
            errors.push(null);
        } else {
            // Calculate SMA: s_t = (1/k) * sum(y_{t-i}) for i=0 to k-1
            let sum = 0;
            for (let i = 0; i < k; i++) {
                sum += series[t - i];
            }
            const st = sum / k;
            smoothed.push(st);

            // Forecast: y_hat_{t+1} = s_t
            forecast.push(st);

            // Error: e_t = y_t - y_hat_t
            const error = t > k - 1 ? series[t] - smoothed[t - 1] : null;
            errors.push(error);
        }
    }

    return { smoothed, forecast, errors };
}

/**
 * Exponential Moving Average (EMA) / Simple Exponential Smoothing
 * @param {Array<number>} series - Time series data
 * @param {number} alpha - Smoothing parameter (0 < alpha < 1)
 * @returns {Object} { smoothed, forecast, errors }
 */
export function ema(series, alpha = 0.3) {
    const smoothed = [];
    const forecast = [];
    const errors = [];

    // Initialize s_0 = y_0
    let st = series[0];
    smoothed.push(st);
    forecast.push(st);
    errors.push(null);

    for (let t = 1; t < series.length; t++) {
        // s_t = alpha * y_t + (1 - alpha) * s_{t-1}
        st = alpha * series[t] + (1 - alpha) * st;
        smoothed.push(st);

        // Forecast: y_hat_{t+1} = s_t
        forecast.push(st);

        // Error: e_t = y_t - y_hat_t (using previous forecast)
        const error = series[t] - forecast[t - 1];
        errors.push(error);
    }

    return { smoothed, forecast, errors };
}

/**
 * Holt's Linear Trend (Double Exponential Smoothing)
 * @param {Array<number>} series - Time series data
 * @param {number} alpha - Level smoothing parameter
 * @param {number} beta - Trend smoothing parameter
 * @returns {Object} { smoothed, forecast, errors, trend }
 */
export function holt(series, alpha = 0.3, beta = 0.1) {
    const smoothed = [];
    const forecast = [];
    const errors = [];
    const trend = [];

    // Initialize l_0 = y_0, b_0 = 0
    let lt = series[0];
    let bt = 0;

    smoothed.push(lt);
    trend.push(bt);
    forecast.push(lt + bt);
    errors.push(null);

    for (let t = 1; t < series.length; t++) {
        const yt = series[t];

        // Update level: l_t = alpha * y_t + (1 - alpha) * (l_{t-1} + b_{t-1})
        const lt_new = alpha * yt + (1 - alpha) * (lt + bt);

        // Update trend: b_t = beta * (l_t - l_{t-1}) + (1 - beta) * b_{t-1}
        const bt_new = beta * (lt_new - lt) + (1 - beta) * bt;

        lt = lt_new;
        bt = bt_new;

        smoothed.push(lt);
        trend.push(bt);

        // Forecast: y_hat_{t+1} = l_t + b_t
        forecast.push(lt + bt);

        // Error: e_t = y_t - y_hat_t
        const error = yt - forecast[t - 1];
        errors.push(error);
    }

    return { smoothed, forecast, errors, trend };
}

/**
 * Calculate Mean Absolute Error (MAE)
 * @param {Array<number>} actual - Actual values
 * @param {Array<number>} predicted - Predicted values
 * @returns {number} MAE
 */
export function calculateMAE(actual, predicted) {
    let sum = 0;
    let count = 0;

    for (let i = 0; i < actual.length; i++) {
        if (actual[i] != null && predicted[i] != null) {
            sum += Math.abs(actual[i] - predicted[i]);
            count++;
        }
    }

    return count > 0 ? sum / count : 0;
}

/**
 * Calculate Mean Absolute Percentage Error (MAPE)
 * @param {Array<number>} actual - Actual values
 * @param {Array<number>} predicted - Predicted values
 * @returns {number} MAPE (as percentage)
 */
export function calculateMAPE(actual, predicted) {
    let sum = 0;
    let count = 0;

    for (let i = 0; i < actual.length; i++) {
        if (actual[i] != null && predicted[i] != null && actual[i] !== 0) {
            sum += Math.abs((actual[i] - predicted[i]) / actual[i]);
            count++;
        }
    }

    return count > 0 ? (sum / count) * 100 : 0;
}

/**
 * Adaptive parameter selection using grid search
 * @param {Array<number>} series - Time series data
 * @param {string} model - 'ema' or 'holt'
 * @param {number} validationSplit - Fraction of data for validation (default 0.2)
 * @returns {Object} { bestParams, bestMAE, bestMAPE }
 */
export function adaptiveSelection(series, model, validationSplit = 0.2) {
    const splitIndex = Math.floor(series.length * (1 - validationSplit));
    const trainSeries = series.slice(0, splitIndex);
    const validSeries = series.slice(splitIndex);

    let bestParams = null;
    let bestMAE = Infinity;
    let bestMAPE = Infinity;

    if (model === 'ema') {
        // Grid search for alpha
        for (let alpha = 0.05; alpha <= 0.95; alpha += 0.05) {
            const result = ema(trainSeries, alpha);

            // Forecast validation period
            const validPredictions = [];
            let st = result.smoothed[result.smoothed.length - 1];
            for (let i = 0; i < validSeries.length; i++) {
                validPredictions.push(st);
                st = alpha * validSeries[i] + (1 - alpha) * st;
            }

            const mae = calculateMAE(validSeries, validPredictions);
            const mape = calculateMAPE(validSeries, validPredictions);

            if (mae < bestMAE) {
                bestMAE = mae;
                bestMAPE = mape;
                bestParams = { alpha: Math.round(alpha * 100) / 100 };
            }
        }
    } else if (model === 'holt') {
        // Grid search for alpha and beta
        for (let alpha = 0.1; alpha <= 0.9; alpha += 0.2) {
            for (let beta = 0.1; beta <= 0.9; beta += 0.2) {
                const result = holt(trainSeries, alpha, beta);

                // Forecast validation period
                const validPredictions = [];
                let lt = result.smoothed[result.smoothed.length - 1];
                let bt = result.trend[result.trend.length - 1];

                for (let i = 0; i < validSeries.length; i++) {
                    validPredictions.push(lt + bt);
                    const lt_new = alpha * validSeries[i] + (1 - alpha) * (lt + bt);
                    const bt_new = beta * (lt_new - lt) + (1 - beta) * bt;
                    lt = lt_new;
                    bt = bt_new;
                }

                const mae = calculateMAE(validSeries, validPredictions);
                const mape = calculateMAPE(validSeries, validPredictions);

                if (mae < bestMAE) {
                    bestMAE = mae;
                    bestMAPE = mape;
                    bestParams = {
                        alpha: Math.round(alpha * 100) / 100,
                        beta: Math.round(beta * 100) / 100
                    };
                }
            }
        }
    }

    return { bestParams, bestMAE, bestMAPE };
}

/**
 * Run forecast with specified model and parameters
 * @param {Object} project - Project data
 * @param {string} metric - 'spend', 'velocity', or 'bugs'
 * @param {string} scenario - 'optimistic', 'realistic', or 'pessimistic'
 * @param {string} model - 'sma', 'ema', or 'holt'
 * @param {Object} params - Model parameters or { auto: true }
 * @param {number} horizon - Forecast horizon (weeks ahead)
 * @returns {Object} Complete forecast results
 */
export function runForecast(project, metric, scenario, model, params, horizon = 4) {
    // Generate baseline series
    const baseline = generateBaseline(project, metric, scenario);

    let result;
    let finalParams = params;

    // Handle auto mode
    if (params.auto) {
        if (model === 'sma') {
            // For SMA, use a reasonable default window
            finalParams = { k: Math.min(4, Math.floor(baseline.length / 4)) };
        } else {
            const adaptive = adaptiveSelection(baseline, model);
            finalParams = adaptive.bestParams;
        }
    }

    // Run the model
    switch (model) {
        case 'sma':
            result = sma(baseline, finalParams.k);
            break;
        case 'ema':
            result = ema(baseline, finalParams.alpha);
            break;
        case 'holt':
            result = holt(baseline, finalParams.alpha, finalParams.beta);
            break;
        default:
            throw new Error(`Unknown model: ${model}`);
    }

    // Calculate metrics on validation portion (last 20%)
    const validationStart = Math.floor(baseline.length * 0.8);
    const actualValid = baseline.slice(validationStart);
    const forecastValid = result.forecast.slice(validationStart);

    const mae = calculateMAE(actualValid, forecastValid);
    const mape = calculateMAPE(actualValid, forecastValid);

    // Generate future forecast
    const futureForecasts = [];
    if (model === 'sma') {
        // For SMA, use last k values
        const lastK = baseline.slice(-finalParams.k);
        const avgLast = lastK.reduce((a, b) => a + b, 0) / lastK.length;
        for (let h = 0; h < horizon; h++) {
            futureForecasts.push(avgLast);
        }
    } else if (model === 'ema') {
        // For EMA, continue smoothing
        let st = result.smoothed[result.smoothed.length - 1];
        for (let h = 0; h < horizon; h++) {
            futureForecasts.push(st);
        }
    } else if (model === 'holt') {
        // For Holt, project trend
        const lt = result.smoothed[result.smoothed.length - 1];
        const bt = result.trend[result.trend.length - 1];
        for (let h = 1; h <= horizon; h++) {
            futureForecasts.push(lt + h * bt);
        }
    }

    return {
        baseline,
        smoothed: result.smoothed,
        forecast: result.forecast,
        errors: result.errors,
        trend: result.trend || null,
        futureForecasts,
        params: finalParams,
        mae,
        mape,
        weeks: baseline.length,
        horizon
    };
}
