import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { typeDefs } from './typeDefs.js';
import { resolvers } from './resolvers/index.js';
import { cacheService } from './cache/cacheService.js';
import {
    generalRateLimit,
    mutationRateLimit,
    complexQueryRateLimit,
    queryComplexityAnalyzer,
    rateLimitLogger
} from './middleware/rateLimiter.js';

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for GraphQL Playground
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com'] // Configure for production
        : true, // Allow all origins in development
    credentials: true
}));

// Rate limiting middleware
app.use(rateLimitLogger);
app.use('/graphql', generalRateLimit);
app.use('/graphql', mutationRateLimit);
app.use('/graphql', complexQueryRateLimit);

// JSON parsing
app.use(express.json({ limit: '10mb' }));

// Query complexity analyzer
app.use('/graphql', queryComplexityAnalyzer);

// Health check endpoint
app.get('/health', (req, res) => {
    const cacheStats = cacheService.getStats();
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        cache: cacheStats,
        memory: process.memoryUsage()
    });
});

// Cache management endpoints (for development/debugging)
if (process.env.NODE_ENV !== 'production') {
    app.post('/cache/clear', (req, res) => {
        cacheService.clearAll();
        res.json({ message: 'Cache cleared successfully' });
    });

    app.get('/cache/stats', (req, res) => {
        res.json(cacheService.getStats());
    });
}

// Create Apollo Server instance
const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    formatError: (error) => {
        console.error('GraphQL Error:', error);
        return {
            message: error.message,
            code: error.extensions?.code,
            path: error.path
        };
    },
    plugins: [
        // Plugin para logging de queries
        {
            requestDidStart() {
                return {
                    didResolveOperation(requestContext) {
                        const query = requestContext.request.query;
                        const complexity = requestContext.request.http?.queryComplexity || 'unknown';
                        console.log(`📊 GraphQL Operation: ${requestContext.operationName || 'anonymous'} | Complexity: ${complexity}`);
                    },
                    didEncounterErrors(requestContext) {
                        console.error('GraphQL errors:', requestContext.errors);
                    }
                };
            }
        }
    ]
});

// Start Apollo Server
await server.start();

// Apply Apollo GraphQL middleware
app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => {
        return {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            queryComplexity: req.queryComplexity,
            // Add any other context needed for resolvers
        };
    },
}));

// Start Express server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 GraphQL Server ready at: http://localhost:${PORT}/graphql`);
    console.log(`📊 GraphQL Playground available at: http://localhost:${PORT}/graphql`);
    console.log(`💊 Health check available at: http://localhost:${PORT}/health`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`🗄️ Cache management available at: http://localhost:${PORT}/cache/stats`);
    }
}); 