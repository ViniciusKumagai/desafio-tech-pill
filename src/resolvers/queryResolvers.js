import { dataService } from '../data/dataService.js';
import { cacheService } from '../cache/cacheService.js';

// Helper function para implementar cache em queries
const withCache = (queryName, resolver, isPaginated = false) => {
    return async (parent, args, context, info) => {
        const cacheKey = cacheService.generateCacheKey(queryName, args);

        // Tentar buscar do cache
        const cachedResult = isPaginated
            ? cacheService.getPaginatedData(cacheKey)
            : cacheService.getStaticData(cacheKey);

        if (cachedResult) {
            console.log(`📋 Cache hit for: ${cacheKey}`);
            return cachedResult;
        }

        // Se não estiver no cache, executar resolver
        console.log(`🔍 Cache miss for: ${cacheKey}`);
        const result = await resolver(parent, args, context, info);

        // Armazenar no cache
        if (isPaginated) {
            cacheService.setPaginatedData(cacheKey, result);
        } else {
            cacheService.setStaticData(cacheKey, result);
        }

        return result;
    };
};

export const queryResolvers = {
    Query: {
        // Pessoas queries
        pessoas: withCache('pessoas', (_, { pagination }) => dataService.getAllPessoasPaginated(pagination), true),
        pessoa: withCache('pessoa', (_, { id }) => dataService.getPessoaById(id)),
        pessoaPorCpf: withCache('pessoaPorCpf', (_, { cpf }) => dataService.getPessoaByCpf(cpf)),
        pessoaPorEmail: withCache('pessoaPorEmail', (_, { email }) => dataService.getPessoaByEmail(email)),

        // Planos queries
        planos: withCache('planos', (_, { pagination }) => dataService.getAllPlanosPaginated(pagination), true),
        plano: withCache('plano', (_, { id }) => dataService.getPlanoById(id)),
        planosPorValorCredito: withCache('planosPorValorCredito', (_, { min, max, pagination }) => dataService.getPlanosByValorCreditoPaginated(min, max, pagination), true),
        planosPorParcelas: withCache('planosPorParcelas', (_, { min, max, pagination }) => dataService.getPlanosByParcelasPaginated(min, max, pagination), true),

        // Planos Contratados queries
        planosContratados: withCache('planosContratados', (_, { pagination }) => dataService.getAllPlanosContratadosPaginated(pagination), true),
        planoContratado: withCache('planoContratado', (_, { id }) => dataService.getPlanoContratadoById(id)),
        planosContratadosPorStatus: withCache('planosContratadosPorStatus', (_, { status, pagination }) => dataService.getPlanosContratadosByStatusPaginated(status, pagination), true),
        planosContratadosPorPessoa: withCache('planosContratadosPorPessoa', (_, { pessoaId, pagination }) => dataService.getPlanosContratadosByPessoaPaginated(pessoaId, pagination), true),
        planosContratadosPorPlano: withCache('planosContratadosPorPlano', (_, { planoId, pagination }) => dataService.getPlanosContratadosByPlanoPaginated(planoId, pagination), true),

        // Statistics queries (cache com TTL maior pois são dados pesados)
        estatisticasGerais: withCache('estatisticasGerais', () => dataService.getEstatisticasGerais()),
    },
}; 