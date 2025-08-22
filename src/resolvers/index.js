import { queryResolvers } from './queryResolvers.js';
import { mutationResolvers } from './mutationResolvers.js';
import { typeResolvers } from './typeResolvers.js';

export const resolvers = {
    ...queryResolvers,
    ...mutationResolvers,
    ...typeResolvers,
}; 