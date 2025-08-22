import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the database file
const DB_PATH = join(__dirname, '../../mock_db.json');

class DataService {
    constructor() {
        this.data = this.loadData();
    }

    // Load data from JSON file
    loadData() {
        try {
            const rawData = readFileSync(DB_PATH, 'utf8');
            return JSON.parse(rawData);
        } catch (error) {
            console.error('Error loading data:', error);
            return { pessoas: [], planos: [], planos_contratados: [] };
        }
    }

    // Save data to JSON file
    saveData() {
        try {
            writeFileSync(DB_PATH, JSON.stringify(this.data, null, 4));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    // Generate new ID for a collection
    generateId(collection) {
        const items = this.data[collection];
        if (items.length === 0) return 1;
        return Math.max(...items.map(item => item.id)) + 1;
    }

    // PESSOAS methods
    getAllPessoas() {
        return this.data.pessoas;
    }

    getPessoaById(id) {
        return this.data.pessoas.find(pessoa => pessoa.id == id);
    }

    getPessoaByCpf(cpf) {
        return this.data.pessoas.find(pessoa => pessoa.cpf === cpf);
    }

    getPessoaByEmail(email) {
        return this.data.pessoas.find(pessoa => pessoa.email === email);
    }

    createPessoa(pessoaData) {
        const newPessoa = {
            id: this.generateId('pessoas'),
            ...pessoaData
        };
        this.data.pessoas.push(newPessoa);
        this.saveData();
        return newPessoa;
    }

    updatePessoa(id, updateData) {
        const pessoaIndex = this.data.pessoas.findIndex(p => p.id == id);
        if (pessoaIndex === -1) return null;

        this.data.pessoas[pessoaIndex] = {
            ...this.data.pessoas[pessoaIndex],
            ...updateData
        };
        this.saveData();
        return this.data.pessoas[pessoaIndex];
    }

    deletePessoa(id) {
        const initialLength = this.data.pessoas.length;
        this.data.pessoas = this.data.pessoas.filter(p => p.id != id);

        if (this.data.pessoas.length < initialLength) {
            this.saveData();
            return true;
        }
        return false;
    }

    // PLANOS methods
    getAllPlanos() {
        return this.data.planos;
    }

    getPlanoById(id) {
        return this.data.planos.find(plano => plano.id == id);
    }

    getPlanosByValorCredito(min, max) {
        return this.data.planos.filter(plano => {
            if (min !== undefined && plano.valor_credito < min) return false;
            if (max !== undefined && plano.valor_credito > max) return false;
            return true;
        });
    }

    getPlanosByParcelas(min, max) {
        return this.data.planos.filter(plano => {
            if (min !== undefined && plano.parcelas < min) return false;
            if (max !== undefined && plano.parcelas > max) return false;
            return true;
        });
    }

    createPlano(planoData) {
        const newPlano = {
            id: this.generateId('planos'),
            ...planoData
        };
        this.data.planos.push(newPlano);
        this.saveData();
        return newPlano;
    }

    updatePlano(id, updateData) {
        const planoIndex = this.data.planos.findIndex(p => p.id == id);
        if (planoIndex === -1) return null;

        this.data.planos[planoIndex] = {
            ...this.data.planos[planoIndex],
            ...updateData
        };
        this.saveData();
        return this.data.planos[planoIndex];
    }

    deletePlano(id) {
        const initialLength = this.data.planos.length;
        this.data.planos = this.data.planos.filter(p => p.id != id);

        if (this.data.planos.length < initialLength) {
            this.saveData();
            return true;
        }
        return false;
    }

    // PLANOS CONTRATADOS methods
    getAllPlanosContratados() {
        return this.data.planos_contratados;
    }

    getPlanoContratadoById(id) {
        return this.data.planos_contratados.find(pc => pc.id == id);
    }

    getPlanosContratadosByStatus(status) {
        return this.data.planos_contratados.filter(pc => pc.status.toUpperCase() === status.toUpperCase());
    }

    getPlanosContratadosByPessoa(pessoaId) {
        return this.data.planos_contratados.filter(pc => pc.pessoa_id == pessoaId);
    }

    getPlanosContratadosByPlano(planoId) {
        return this.data.planos_contratados.filter(pc => pc.plano_id == planoId);
    }

    contratarPlano(contratoData) {
        const newContrato = {
            id: this.generateId('planos_contratados'),
            ...contratoData,
            status: 'ativo',
            parcelas_pagas: 0
        };
        this.data.planos_contratados.push(newContrato);
        this.saveData();
        return newContrato;
    }

    updateStatusPlano(id, status) {
        const contratoIndex = this.data.planos_contratados.findIndex(pc => pc.id == id);
        if (contratoIndex === -1) return null;

        this.data.planos_contratados[contratoIndex].status = status.toLowerCase();
        this.saveData();
        return this.data.planos_contratados[contratoIndex];
    }

    pagarParcela(id) {
        const contratoIndex = this.data.planos_contratados.findIndex(pc => pc.id == id);
        if (contratoIndex === -1) return null;

        this.data.planos_contratados[contratoIndex].parcelas_pagas += 1;

        // Check if plan is fully paid
        const plano = this.getPlanoById(this.data.planos_contratados[contratoIndex].plano_id);
        if (plano && this.data.planos_contratados[contratoIndex].parcelas_pagas >= plano.parcelas) {
            this.data.planos_contratados[contratoIndex].status = 'quitado';
        }

        this.saveData();
        return this.data.planos_contratados[contratoIndex];
    }

    cancelarPlano(id) {
        const initialLength = this.data.planos_contratados.length;
        this.data.planos_contratados = this.data.planos_contratados.filter(pc => pc.id != id);

        if (this.data.planos_contratados.length < initialLength) {
            this.saveData();
            return true;
        }
        return false;
    }

    // STATISTICS methods
    getEstatisticasGerais() {
        const pessoas = this.data.pessoas;
        const planos = this.data.planos;
        const planosContratados = this.data.planos_contratados;

        const stats = {
            totalPessoas: pessoas.length,
            totalPlanos: planos.length,
            totalPlanosContratados: planosContratados.length,
            planosAtivos: planosContratados.filter(pc => pc.status === 'ativo').length,
            planosContemplados: planosContratados.filter(pc => pc.status === 'contemplado').length,
            planosInadimplentes: planosContratados.filter(pc => pc.status === 'inadimplente').length,
            planosQuitados: planosContratados.filter(pc => pc.status === 'quitado').length,
            valorTotalCredito: planos.reduce((sum, plano) => sum + plano.valor_credito, 0),
            valorTotalArrecadado: 0 // We'll calculate this based on paid installments
        };

        // Calculate total collected amount
        planosContratados.forEach(pc => {
            const plano = planos.find(p => p.id === pc.plano_id);
            if (plano) {
                const valorParcela = (plano.valor_credito * (1 + plano.taxa_adm_percentual / 100)) / plano.parcelas;
                stats.valorTotalArrecadado += valorParcela * pc.parcelas_pagas;
            }
        });

        return stats;
    }
}

// Export singleton instance
export const dataService = new DataService(); 