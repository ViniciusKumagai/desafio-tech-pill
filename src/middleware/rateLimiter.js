import rateLimit from 'express-rate-limit';

// Rate limiter geral para todas as requests
export const generalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP por janela de tempo
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 15 * 60 // em segundos
    },
    standardHeaders: true, // Retorna rate limit info nos headers `RateLimit-*`
    legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
    skip: (req) => {
        // Skip rate limiting para requisições de introspection durante desenvolvimento
        const query = req.body?.query || '';
        return query.includes('__schema') || query.includes('__type');
    }
});

// Rate limiter mais restritivo para mutations
export const mutationRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 20, // máximo 20 mutations por IP por janela de tempo
    message: {
        error: 'Too many mutations from this IP, please try again later.',
        retryAfter: 5 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        const query = req.body?.query || '';
        // Aplica apenas se a query contém mutations
        return !query.includes('mutation');
    }
});

// Rate limiter para queries complexas
export const complexQueryRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 50, // máximo 50 queries complexas por IP por janela de tempo
    message: {
        error: 'Too many complex queries from this IP, please try again later.',
        retryAfter: 10 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        const query = req.body?.query || '';
        // Considera complexa se tem múltiplos campos relacionados ou paginação
        const hasComplexQuery = query.includes('planosContratados') ||
            query.includes('pagination') ||
            query.includes('estatisticas');
        return !hasComplexQuery;
    }
});

// Middleware customizado para análise de complexidade de query GraphQL
export const queryComplexityAnalyzer = (req, res, next) => {
    const query = req.body?.query || '';

    // Análise simples de complexidade baseada em padrões
    let complexity = 0;

    // Contar campos aninhados
    const nestingLevel = (query.match(/{/g) || []).length;
    complexity += nestingLevel * 2;

    // Contar joins (queries que buscam entidades relacionadas)
    const relationFields = ['pessoa', 'plano', 'planosContratados'].filter(field =>
        query.includes(field)
    );
    complexity += relationFields.length * 5;

    // Verificar paginação
    if (query.includes('pagination')) {
        complexity += 3;
    }

    // Verificar estatísticas (query mais pesada)
    if (query.includes('estatisticas')) {
        complexity += 10;
    }

    // Bloquear queries muito complexas
    if (complexity > 30) {
        return res.status(400).json({
            error: 'Query too complex. Please simplify your request.',
            complexity: complexity,
            maxAllowed: 30
        });
    }

    // Adicionar info de complexidade ao request para logging
    req.queryComplexity = complexity;
    next();
};

// Middleware para logging de rate limiting
export const rateLimitLogger = (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
        // Log quando rate limit é atingido
        if (res.statusCode === 429) {
            console.warn(`🚫 Rate limit exceeded for IP: ${req.ip} at ${new Date().toISOString()}`);
            console.warn(`Query complexity: ${req.queryComplexity || 'unknown'}`);
            console.warn(`User-Agent: ${req.get('User-Agent') || 'unknown'}`);
        }

        originalSend.call(this, data);
    };

    next();
}; 