import { dataService } from '../data/dataService.js';

export const queryResolvers = {
    Query: {
        // Pessoas queries
        pessoas: () => dataService.getAllPessoas(),
        pessoa: (_, { id }) => dataService.getPessoaById(id),
        pessoaPorCpf: (_, { cpf }) => dataService.getPessoaByCpf(cpf),
        pessoaPorEmail: (_, { email }) => dataService.getPessoaByEmail(email),

        // Planos queries
        planos: () => dataService.getAllPlanos(),
        plano: (_, { id }) => dataService.getPlanoById(id),
        planosPorValorCredito: (_, { min, max }) => dataService.getPlanosByValorCredito(min, max),
        planosPorParcelas: (_, { min, max }) => dataService.getPlanosByParcelas(min, max),

        // Planos Contratados queries
        planosContratados: () => dataService.getAllPlanosContratados(),
        planoContratado: (_, { id }) => dataService.getPlanoContratadoById(id),
        planosContratadosPorStatus: (_, { status }) => dataService.getPlanosContratadosByStatus(status),
        planosContratadosPorPessoa: (_, { pessoaId }) => dataService.getPlanosContratadosByPessoa(pessoaId),
        planosContratadosPorPlano: (_, { planoId }) => dataService.getPlanosContratadosByPlano(planoId),

        // Statistics queries
        estatisticasGerais: () => dataService.getEstatisticasGerais(),
    },
}; 