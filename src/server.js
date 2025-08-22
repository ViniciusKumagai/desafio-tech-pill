import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './typeDefs.js';
import { resolvers } from './resolvers/index.js';

// Create Apollo Server instance
const server = new ApolloServer({
    typeDefs,
    resolvers,
    // Enable GraphQL Playground in development
    introspection: true,
    plugins: []
});

// Start the server
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => {
        // Add any context needed for resolvers here
        // For example: authentication, database connections, etc.
        return {
            // We'll add database context here later
        };
    },
});

console.log(`🚀 GraphQL Server ready at: ${url}`);
console.log(`📊 GraphQL Playground available at: ${url}`); 