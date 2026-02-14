-- ============================================================
-- ExpertPM — Seed Data
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- ===================== STRATEGIES =====================

INSERT INTO strategies (id, name, description, category) VALUES
('11111111-0001-0001-0001-000000000001', 'Scrum',
 '{"en": "Iterative development with sprints, daily standups, and continuous delivery. Best for teams that need flexibility and rapid feedback.", "uk": "Ітеративна розробка зі спринтами, щоденними стендапами та безперервною поставкою. Найкраще для команд, які потребують гнучкості та швидкого зворотного зв''язку."}'::jsonb,
 'agile'),

('11111111-0001-0001-0001-000000000002', 'Kanban',
 '{"en": "Flow-based process with visual boards, WIP limits, and continuous improvement. Ideal for support and maintenance projects.", "uk": "Потоковий процес з візуальними дошками, обмеженнями WIP та безперервним покращенням. Ідеальний для проєктів підтримки та обслуговування."}'::jsonb,
 'agile'),

('11111111-0001-0001-0001-000000000003', 'Waterfall',
 '{"en": "Sequential phase-based approach with clear milestones and documentation. Suitable for projects with stable requirements and regulatory constraints.", "uk": "Послідовний фазовий підхід з чіткими віхами та документацією. Підходить для проєктів зі стабільними вимогами та регуляторними обмеженнями."}'::jsonb,
 'traditional'),

('11111111-0001-0001-0001-000000000004', 'SAFe (Scaled Agile)',
 '{"en": "Scaled Agile Framework for large teams and complex enterprise projects. Combines agile practices with organizational alignment.", "uk": "Масштабований Agile-фреймворк для великих команд та складних корпоративних проєктів. Поєднує agile-практики з організаційним вирівнюванням."}'::jsonb,
 'agile'),

('11111111-0001-0001-0001-000000000005', 'Lean',
 '{"en": "Minimizing waste and maximizing value delivery. Focus on eliminating non-value activities and optimizing flow.", "uk": "Мінімізація витрат та максимізація цінності. Фокус на усуненні неціннісних активностей та оптимізації потоку."}'::jsonb,
 'lean'),

('11111111-0001-0001-0001-000000000006', 'Hybrid Agile-Waterfall',
 '{"en": "Combining structured phases with agile iterations within each phase. Good balance between predictability and flexibility.", "uk": "Поєднання структурованих фаз з agile-ітераціями всередині кожної фази. Гарний баланс між передбачуваністю та гнучкістю."}'::jsonb,
 'hybrid'),

('11111111-0001-0001-0001-000000000007', 'Rapid Prototyping',
 '{"en": "Quick prototype development with iterative refinement based on user feedback. Ideal for research and innovation projects.", "uk": "Швидке створення прототипів з ітеративним вдосконаленням на основі зворотного зв''язку. Ідеально для дослідницьких та інноваційних проєктів."}'::jsonb,
 'agile'),

('11111111-0001-0001-0001-000000000008', 'Risk-Driven',
 '{"en": "Prioritizing risk mitigation as the primary management strategy. Systematic risk assessment and contingency planning drive all decisions.", "uk": "Пріоритизація зменшення ризиків як основна стратегія управління. Систематична оцінка ризиків та планування на випадок непередбачених ситуацій визначають усі рішення."}'::jsonb,
 'risk');

-- ===================== KNOWLEDGE PROJECTS =====================

INSERT INTO knowledge_projects (name, description, team_size, budget, duration_months, complexity, project_type, risk_level, team_experience, client_involvement, requirements_stability, tech_stack_novelty, strategy_id, outcome) VALUES

-- Scrum success cases
('E-Commerce Platform Redesign', 'Complete redesign of online store with new UX/UI', 8, 120000, 6, 'medium', 'development', 'medium', 'senior', 'active', 'evolving', 'moderate', '11111111-0001-0001-0001-000000000001', 'success'),
('Mobile Banking App', 'Native mobile app for retail banking', 12, 350000, 9, 'high', 'development', 'high', 'senior', 'active', 'evolving', 'moderate', '11111111-0001-0001-0001-000000000001', 'success'),
('SaaS Dashboard MVP', 'Minimum viable product for analytics dashboard', 5, 80000, 4, 'medium', 'development', 'medium', 'mixed', 'embedded', 'volatile', 'moderate', '11111111-0001-0001-0001-000000000001', 'success'),

-- Kanban cases
('Legacy System Support', 'Ongoing support and bug fixing for ERP system', 4, 60000, 12, 'low', 'support', 'low', 'mixed', 'minimal', 'stable', 'established', '11111111-0001-0001-0001-000000000002', 'success'),
('DevOps Pipeline Optimization', 'CI/CD pipeline improvements and monitoring', 3, 45000, 6, 'medium', 'support', 'low', 'senior', 'minimal', 'evolving', 'moderate', '11111111-0001-0001-0001-000000000002', 'success'),

-- Waterfall cases
('Government Portal', 'Citizen services portal with strict regulations', 15, 500000, 18, 'high', 'development', 'medium', 'mixed', 'moderate', 'stable', 'established', '11111111-0001-0001-0001-000000000003', 'success'),
('ERP Data Migration', 'Large-scale data migration from legacy ERP', 10, 200000, 8, 'high', 'migration', 'high', 'senior', 'moderate', 'stable', 'established', '11111111-0001-0001-0001-000000000003', 'success'),
('Medical Records System', 'Healthcare records management with HIPAA compliance', 20, 800000, 24, 'critical', 'development', 'critical', 'expert', 'moderate', 'stable', 'established', '11111111-0001-0001-0001-000000000003', 'partial'),

-- SAFe cases
('Enterprise CRM Overhaul', 'Complete CRM replacement for Fortune 500 company', 45, 2000000, 18, 'critical', 'development', 'high', 'mixed', 'active', 'evolving', 'moderate', '11111111-0001-0001-0001-000000000004', 'success'),
('Multi-platform Banking System', 'Integrated cross-platform banking solution', 60, 5000000, 24, 'critical', 'integration', 'critical', 'senior', 'active', 'evolving', 'cutting_edge', '11111111-0001-0001-0001-000000000004', 'partial'),

-- Lean cases
('Process Automation Tool', 'Internal workflow automation for HR', 4, 35000, 3, 'low', 'development', 'low', 'mixed', 'active', 'evolving', 'established', '11111111-0001-0001-0001-000000000005', 'success'),
('Inventory Management System', 'Lean inventory tracking for warehouse', 6, 75000, 5, 'medium', 'development', 'medium', 'senior', 'active', 'stable', 'established', '11111111-0001-0001-0001-000000000005', 'success'),

-- Hybrid cases
('Insurance Claims Platform', 'Claims processing system with phased rollout', 18, 450000, 12, 'high', 'development', 'high', 'mixed', 'moderate', 'evolving', 'moderate', '11111111-0001-0001-0001-000000000006', 'success'),
('Cloud Migration Project', 'Moving on-prem infrastructure to AWS', 8, 180000, 9, 'high', 'migration', 'high', 'senior', 'minimal', 'stable', 'cutting_edge', '11111111-0001-0001-0001-000000000006', 'success'),

-- Rapid Prototyping cases
('AI Chatbot Research', 'Experimental NLP chatbot for customer service', 3, 40000, 3, 'medium', 'research', 'medium', 'expert', 'embedded', 'volatile', 'cutting_edge', '11111111-0001-0001-0001-000000000007', 'success'),
('IoT Dashboard Prototype', 'Quick prototype for smart factory monitoring', 4, 55000, 2, 'medium', 'research', 'medium', 'senior', 'embedded', 'volatile', 'cutting_edge', '11111111-0001-0001-0001-000000000007', 'success'),

-- Risk-Driven cases
('Financial Trading Platform', 'High-frequency trading system upgrade', 15, 1200000, 12, 'critical', 'development', 'critical', 'expert', 'moderate', 'stable', 'cutting_edge', '11111111-0001-0001-0001-000000000008', 'success'),
('Nuclear Plant Monitoring', 'Safety monitoring system for power plant', 25, 3000000, 24, 'critical', 'development', 'critical', 'expert', 'minimal', 'stable', 'established', '11111111-0001-0001-0001-000000000008', 'success');


-- ===================== STRATEGY RULES =====================

-- === SCRUM RULES ===
INSERT INTO strategy_rules (strategy_id, conditions, weight, description) VALUES
('11111111-0001-0001-0001-000000000001',
 '{"requirements_stability": "evolving", "client_involvement": {"in": ["active", "embedded"]}}'::jsonb,
 3,
 '{"en": "Evolving requirements + active client = perfect for Scrum sprints", "uk": "Змінні вимоги + активний клієнт = ідеально для Scrum спринтів"}'::jsonb),

('11111111-0001-0001-0001-000000000001',
 '{"team_size": {"min": 3, "max": 15}, "complexity": {"in": ["medium", "high"]}}'::jsonb,
 2,
 '{"en": "Medium-sized team with moderate-high complexity fits Scrum well", "uk": "Середня команда з помірно-високою складністю добре підходить для Scrum"}'::jsonb),

('11111111-0001-0001-0001-000000000001',
 '{"project_type": "development", "team_experience": {"in": ["mixed", "senior"]}}'::jsonb,
 2,
 '{"en": "Development project with experienced team benefits from iterative approach", "uk": "Проєкт розробки з досвідченою командою виграє від ітеративного підходу"}'::jsonb),

('11111111-0001-0001-0001-000000000001',
 '{"requirements_stability": "volatile", "duration_months": {"max": 8}}'::jsonb,
 2,
 '{"en": "Short project with volatile requirements needs agile adaptation", "uk": "Короткий проєкт з нестабільними вимогами потребує agile адаптації"}'::jsonb),

-- === KANBAN RULES ===
('11111111-0001-0001-0001-000000000002',
 '{"project_type": "support", "requirements_stability": "stable"}'::jsonb,
 3,
 '{"en": "Support projects with stable flow are ideal for Kanban", "uk": "Проєкти підтримки зі стабільним потоком ідеальні для Kanban"}'::jsonb),

('11111111-0001-0001-0001-000000000002',
 '{"team_size": {"min": 1, "max": 8}, "complexity": {"in": ["low", "medium"]}}'::jsonb,
 2,
 '{"en": "Small team with low-medium complexity benefits from Kanban simplicity", "uk": "Маленька команда з низькою-середньою складністю виграє від простоти Kanban"}'::jsonb),

('11111111-0001-0001-0001-000000000002',
 '{"client_involvement": "minimal", "risk_level": "low"}'::jsonb,
 2,
 '{"en": "Low client involvement and low risk suit continuous flow management", "uk": "Низька залученість клієнта та низький ризик підходять для управління безперервним потоком"}'::jsonb),

-- === WATERFALL RULES ===
('11111111-0001-0001-0001-000000000003',
 '{"requirements_stability": "stable", "tech_stack_novelty": "established"}'::jsonb,
 3,
 '{"en": "Stable requirements with proven technology fit sequential approach", "uk": "Стабільні вимоги з перевіреними технологіями підходять для послідовного підходу"}'::jsonb),

('11111111-0001-0001-0001-000000000003',
 '{"project_type": "migration", "requirements_stability": "stable"}'::jsonb,
 3,
 '{"en": "Migration projects with clear scope benefit from phased approach", "uk": "Проєкти міграції з чітким обсягом виграють від фазового підходу"}'::jsonb),

('11111111-0001-0001-0001-000000000003',
 '{"risk_level": {"in": ["medium", "high"]}, "requirements_stability": "stable", "client_involvement": {"in": ["minimal", "moderate"]}}'::jsonb,
 2,
 '{"en": "Regulated environments with clear documentation needs", "uk": "Регульовані середовища з потребою в чіткій документації"}'::jsonb),

-- === SAFe RULES ===
('11111111-0001-0001-0001-000000000004',
 '{"team_size": {"min": 25}, "complexity": {"in": ["high", "critical"]}}'::jsonb,
 4,
 '{"en": "Large teams with critical complexity require scaled framework", "uk": "Великі команди з критичною складністю потребують масштабованого фреймворку"}'::jsonb),

('11111111-0001-0001-0001-000000000004',
 '{"team_size": {"min": 15}, "project_type": "integration"}'::jsonb,
 3,
 '{"en": "Large integration projects benefit from SAFe coordination", "uk": "Великі інтеграційні проєкти виграють від координації SAFe"}'::jsonb),

('11111111-0001-0001-0001-000000000004',
 '{"budget": {"min": 1000000}, "duration_months": {"min": 12}}'::jsonb,
 2,
 '{"en": "High-budget long-term projects need enterprise-scale management", "uk": "Довготермінові проєкти з великим бюджетом потребують управління корпоративного масштабу"}'::jsonb),

-- === LEAN RULES ===
('11111111-0001-0001-0001-000000000005',
 '{"budget": {"max": 100000}, "team_size": {"max": 8}}'::jsonb,
 3,
 '{"en": "Small budget + small team = eliminate waste with Lean", "uk": "Малий бюджет + маленька команда = усуньте витрати з Lean"}'::jsonb),

('11111111-0001-0001-0001-000000000005',
 '{"complexity": "low", "client_involvement": "active"}'::jsonb,
 2,
 '{"en": "Simple projects with active clients benefit from Lean value focus", "uk": "Прості проєкти з активними клієнтами виграють від фокусу Lean на цінності"}'::jsonb),

('11111111-0001-0001-0001-000000000005',
 '{"duration_months": {"max": 6}, "risk_level": {"in": ["low", "medium"]}}'::jsonb,
 2,
 '{"en": "Short low-risk projects benefit from minimized overhead", "uk": "Короткі проєкти з низьким ризиком виграють від мінімізованих накладних витрат"}'::jsonb),

-- === HYBRID RULES ===
('11111111-0001-0001-0001-000000000006',
 '{"complexity": "high", "requirements_stability": "evolving", "client_involvement": "moderate"}'::jsonb,
 3,
 '{"en": "Complex projects with evolving reqs and moderate client involvement suit hybrid approach", "uk": "Складні проєкти зі змінними вимогами та помірною залученістю клієнта підходять для гібридного підходу"}'::jsonb),

('11111111-0001-0001-0001-000000000006',
 '{"project_type": "migration", "tech_stack_novelty": "cutting_edge"}'::jsonb,
 3,
 '{"en": "Migration to new technology benefits from structured phases with agile exploration", "uk": "Міграція на нові технології виграє від структурованих фаз з agile дослідженням"}'::jsonb),

('11111111-0001-0001-0001-000000000006',
 '{"team_experience": "mixed", "risk_level": "high"}'::jsonb,
 2,
 '{"en": "Mixed experience team in high-risk project needs balance of structure and flexibility", "uk": "Команда зі змішаним досвідом у проєкті з високим ризиком потребує балансу структури та гнучкості"}'::jsonb),

-- === RAPID PROTOTYPING RULES ===
('11111111-0001-0001-0001-000000000007',
 '{"project_type": "research", "requirements_stability": "volatile"}'::jsonb,
 4,
 '{"en": "Research projects with volatile requirements need rapid experimentation", "uk": "Дослідницькі проєкти з нестабільними вимогами потребують швидкого експериментування"}'::jsonb),

('11111111-0001-0001-0001-000000000007',
 '{"tech_stack_novelty": "cutting_edge", "client_involvement": "embedded"}'::jsonb,
 3,
 '{"en": "Cutting-edge tech with embedded client allows fast prototype iterations", "uk": "Найновіші технології з інтегрованим клієнтом дозволяють швидкі ітерації прототипів"}'::jsonb),

('11111111-0001-0001-0001-000000000007',
 '{"duration_months": {"max": 4}, "team_size": {"max": 6}}'::jsonb,
 2,
 '{"en": "Small short projects benefit from rapid prototyping speed", "uk": "Малі короткі проєкти виграють від швидкості прототипування"}'::jsonb),

-- === RISK-DRIVEN RULES ===
('11111111-0001-0001-0001-000000000008',
 '{"risk_level": "critical", "complexity": "critical"}'::jsonb,
 4,
 '{"en": "Critical risk + critical complexity demands risk-driven management", "uk": "Критичний ризик + критична складність вимагають управління на основі ризиків"}'::jsonb),

('11111111-0001-0001-0001-000000000008',
 '{"risk_level": "critical", "budget": {"min": 500000}}'::jsonb,
 3,
 '{"en": "High-budget critical-risk projects need systematic risk management", "uk": "Проєкти з великим бюджетом та критичним ризиком потребують систематичного управління ризиками"}'::jsonb),

('11111111-0001-0001-0001-000000000008',
 '{"risk_level": {"in": ["high", "critical"]}, "team_experience": "expert"}'::jsonb,
 2,
 '{"en": "Expert teams can effectively execute risk-driven strategies", "uk": "Команди експертів можуть ефективно виконувати стратегії на основі ризиків"}'::jsonb),

('11111111-0001-0001-0001-000000000008',
 '{"complexity": "critical", "requirements_stability": "stable", "tech_stack_novelty": "cutting_edge"}'::jsonb,
 3,
 '{"en": "Critical complexity with new tech requires careful risk assessment despite stable requirements", "uk": "Критична складність з новими технологіями потребує ретельної оцінки ризиків, незважаючи на стабільні вимоги"}'::jsonb);
