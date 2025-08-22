import { dataService } from '../data/dataService.js';
import { cacheService } from '../cache/cacheService.js';

// Helper function para invalidar cache após mutations
const withCacheInvalidation = (mutationFn, entityType) => {
    return async (...args) => {
        const result = await mutationFn(...args);
        // Invalidar cache da entidade modificada
        cacheService.invalidateEntityCache(entityType);
        console.log(`🗑️ Cache invalidated for entity: ${entityType}`);
        return result;
    };
};

export const mutationResolvers = {
    Mutation: {
        // Pessoas mutations
        criarPessoa: withCacheInvalidation((_, { input }) => dataService.createPessoa(input), 'pessoas'),
        atualizarPessoa: withCacheInvalidation((_, { id, input }) => dataService.updatePessoa(id, input), 'pessoas'),
        deletarPessoa: withCacheInvalidation((_, { id }) => dataService.deletePessoa(id), 'pessoas'),

        // Planos mutations
        criarPlano: withCacheInvalidation((_, { input }) => {
            // Convert GraphQL field names to database field names
            const planoData = {
                nome: input.nome,
                valor_credito: input.valorCredito,
                parcelas: input.parcelas,
                taxa_adm_percentual: input.taxaAdmPercentual
            };
            return dataService.createPlano(planoData);
        }, 'planos'),

        atualizarPlano: withCacheInvalidation((_, { id, input }) => {
            // Convert GraphQL field names to database field names
            const updateData = {};
            if (input.nome !== undefined) updateData.nome = input.nome;
            if (input.valorCredito !== undefined) updateData.valor_credito = input.valorCredito;
            if (input.parcelas !== undefined) updateData.parcelas = input.parcelas;
            if (input.taxaAdmPercentual !== undefined) updateData.taxa_adm_percentual = input.taxaAdmPercentual;

            return dataService.updatePlano(id, updateData);
        }, 'planos'),

        deletarPlano: withCacheInvalidation((_, { id }) => dataService.deletePlano(id), 'planos'),

        // Planos Contratados mutations
        contratarPlano: withCacheInvalidation((_, { input }) => {
            // Convert GraphQL field names to database field names
            const contratoData = {
                pessoa_id: input.pessoaId,
                plano_id: input.planoId,
                data_contratacao: input.dataContratacao
            };
            return dataService.contratarPlano(contratoData);
        }, 'planosContratados'),

        atualizarStatusPlano: withCacheInvalidation((_, { id, status }) => dataService.updateStatusPlano(id, status), 'planosContratados'),
        pagarParcela: withCacheInvalidation((_, { id }) => dataService.pagarParcela(id), 'planosContratados'),
        cancelarPlano: withCacheInvalidation((_, { id }) => dataService.cancelarPlano(id), 'planosContratados'),
    },
}; 