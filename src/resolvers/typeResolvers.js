import { dataService } from '../data/dataService.js';

export const typeResolvers = {
    Pessoa: {
        planosContratados: (pessoa) => dataService.getPlanosContratadosByPessoa(pessoa.id),
    },

    Plano: {
        planosContratados: (plano) => dataService.getPlanosContratadosByPlano(plano.id),
        // Convert database field names to GraphQL field names
        valorCredito: (plano) => plano.valor_credito,
        taxaAdmPercentual: (plano) => plano.taxa_adm_percentual,
    },

    PlanoContratado: {
        pessoa: (planoContratado) => dataService.getPessoaById(planoContratado.pessoa_id),
        plano: (planoContratado) => dataService.getPlanoById(planoContratado.plano_id),

        // Convert database field names to GraphQL field names
        dataContratacao: (planoContratado) => planoContratado.data_contratacao,
        parcelasPagas: (planoContratado) => planoContratado.parcelas_pagas,

        // Computed fields
        parcelasRestantes: (planoContratado) => {
            const plano = dataService.getPlanoById(planoContratado.plano_id);
            return plano ? plano.parcelas - planoContratado.parcelas_pagas : 0;
        },

        valorParcela: (planoContratado) => {
            const plano = dataService.getPlanoById(planoContratado.plano_id);
            if (!plano) return 0;

            // Calculate installment value: (credit_value * (1 + admin_rate)) / installments
            const valorComTaxa = plano.valor_credito * (1 + plano.taxa_adm_percentual / 100);
            return valorComTaxa / plano.parcelas;
        },

        progressoPagamento: (planoContratado) => {
            const plano = dataService.getPlanoById(planoContratado.plano_id);
            if (!plano) return 0;

            return (planoContratado.parcelas_pagas / plano.parcelas) * 100;
        },

        // Convert status to uppercase for the enum
        status: (planoContratado) => planoContratado.status.toUpperCase(),
    },
}; 