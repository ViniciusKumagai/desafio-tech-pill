import { dataService } from '../data/dataService.js';

export const mutationResolvers = {
    Mutation: {
        // Pessoas mutations
        criarPessoa: (_, { input }) => dataService.createPessoa(input),
        atualizarPessoa: (_, { id, input }) => dataService.updatePessoa(id, input),
        deletarPessoa: (_, { id }) => dataService.deletePessoa(id),

        // Planos mutations
        criarPlano: (_, { input }) => {
            // Convert GraphQL field names to database field names
            const planoData = {
                nome: input.nome,
                valor_credito: input.valorCredito,
                parcelas: input.parcelas,
                taxa_adm_percentual: input.taxaAdmPercentual
            };
            return dataService.createPlano(planoData);
        },

        atualizarPlano: (_, { id, input }) => {
            // Convert GraphQL field names to database field names
            const updateData = {};
            if (input.nome !== undefined) updateData.nome = input.nome;
            if (input.valorCredito !== undefined) updateData.valor_credito = input.valorCredito;
            if (input.parcelas !== undefined) updateData.parcelas = input.parcelas;
            if (input.taxaAdmPercentual !== undefined) updateData.taxa_adm_percentual = input.taxaAdmPercentual;

            return dataService.updatePlano(id, updateData);
        },

        deletarPlano: (_, { id }) => dataService.deletePlano(id),

        // Planos Contratados mutations
        contratarPlano: (_, { input }) => {
            // Convert GraphQL field names to database field names
            const contratoData = {
                pessoa_id: input.pessoaId,
                plano_id: input.planoId,
                data_contratacao: input.dataContratacao
            };
            return dataService.contratarPlano(contratoData);
        },

        atualizarStatusPlano: (_, { id, status }) => dataService.updateStatusPlano(id, status),
        pagarParcela: (_, { id }) => dataService.pagarParcela(id),
        cancelarPlano: (_, { id }) => dataService.cancelarPlano(id),
    },
}; 