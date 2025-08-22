# API GraphQL para Sistema de Consórcio

Este projeto é uma API GraphQL que gerencia um sistema de consórcio, onde pessoas podem contratar planos e fazer pagamentos.

## O que o sistema faz

- **Cadastra pessoas** com seus dados pessoais
- **Gerencia planos de consórcio** com valores e parcelas
- **Controla contratos** entre pessoas e planos
- **Acompanha pagamentos** e status dos contratos
- **Mostra estatísticas** do sistema

## Como usar

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar o servidor
```bash
npm start
```

### 3. Acessar a interface
Abra o navegador em: `http://localhost:4000/graphql`

## Estrutura do Código

### 📁 Arquivos principais

- **`src/server.js`** - Inicia o servidor e configura segurança
- **`src/typeDefs.js`** - Carrega as definições do GraphQL
- **`schema.graphql`** - Define os tipos de dados e operações
- **`mock_db.json`** - Banco de dados simulado em JSON

### 📁 Pasta `src/data/`

- **`dataService.js`** - Faz todas as operações com os dados (buscar, criar, alterar, deletar)

### 📁 Pasta `src/resolvers/`

- **`queryResolvers.js`** - Funções que buscam dados
- **`mutationResolvers.js`** - Funções que modificam dados
- **`typeResolvers.js`** - Conecta dados relacionados
- **`index.js`** - Junta todos os resolvers

### 📁 Pasta `src/cache/`

- **`cacheService.js`** - Sistema que guarda resultados para responder mais rápido

### 📁 Pasta `src/middleware/`

- **`rateLimiter.js`** - Controla quantas requisições cada usuário pode fazer

## Funcionalidades Implementadas

### 🗃️ Paginação
- **O que faz**: Divide listas grandes em páginas menores
- **Por que**: Evita carregar muitos dados de uma vez
- **Como usar**: Adicione `pagination: { page: 1, limit: 10 }` nas consultas

### 🗄️ Cache (Memória Temporária)
- **O que faz**: Guarda resultados de consultas por alguns minutos
- **Por que**: Faz o sistema responder mais rápido
- **Como funciona**: 
  - Primeira consulta = busca no banco
  - Segunda consulta = pega da memória (mais rápido)

### 🚫 Limitação de Requests
- **O que faz**: Limita quantas consultas cada IP pode fazer
- **Por que**: Protege o servidor de sobrecarga
- **Limites atuais**:
  - 100 consultas gerais por 15 minutos
  - 20 modificações de dados por 5 minutos
  - 50 consultas complexas por 10 minutos

### 🛡️ Segurança
- **Headers de segurança**: Protege contra ataques comuns
- **CORS**: Controla quais sites podem usar a API
- **Análise de complexidade**: Bloqueia consultas muito pesadas

## Tipos de Dados

### Pessoa
```
- id: Identificador único
- nome: Nome completo
- cpf: CPF da pessoa
- email: Email de contato
- telefone: Telefone de contato
```

### Plano
```
- id: Identificador único
- nome: Nome do plano
- valorCredito: Valor total do crédito
- parcelas: Número de parcelas
- taxaAdmPercentual: Taxa administrativa
```

### PlanoContratado
```
- id: Identificador único
- pessoa: Pessoa que contratou
- plano: Plano contratado
- dataContratacao: Data da contratação
- status: ATIVO, CONTEMPLADO, INADIMPLENTE, QUITADO
- parcelasPagas: Quantas parcelas já foram pagas
- valorParcela: Valor de cada parcela (calculado automaticamente)
```

## Exemplos de Uso

### Buscar todas as pessoas (com paginação)
```graphql
query {
  pessoas(pagination: { page: 1, limit: 5 }) {
    edges {
      node {
        id
        nome
        email
      }
    }
    pageInfo {
      totalCount
      hasNextPage
      currentPage
    }
  }
}
```

### Buscar uma pessoa específica
```graphql
query {
  pessoa(id: "1") {
    nome
    email
    planosContratados {
      status
      parcelasPagas
      plano {
        nome
        valorCredito
      }
    }
  }
}
```

### Criar uma nova pessoa
```graphql
mutation {
  criarPessoa(input: {
    nome: "João Silva"
    cpf: "123.456.789-01"
    email: "joao@email.com"
    telefone: "(11) 99999-9999"
  }) {
    id
    nome
    email
  }
}
```

### Contratar um plano
```graphql
mutation {
  contratarPlano(input: {
    pessoaId: "1"
    planoId: "101"
    dataContratacao: "2024-01-15"
  }) {
    id
    pessoa { nome }
    plano { nome }
    status
  }
}
```

### Pagar uma parcela
```graphql
mutation {
  pagarParcela(id: "1001") {
    parcelasPagas
    parcelasRestantes
    progressoPagamento
    status
  }
}
```

### Ver estatísticas gerais
```graphql
query {
  estatisticasGerais {
    totalPessoas
    totalPlanos
    totalPlanosContratados
    planosAtivos
    valorTotalCredito
    valorTotalArrecadado
  }
}
```

## Monitoramento

### Verificar saúde do servidor
```
GET /health
```
Mostra se o servidor está funcionando e estatísticas de performance.

### Ver estatísticas do cache
```
GET /cache/stats
```
Mostra quantas consultas foram atendidas pelo cache.

### Limpar cache
```
POST /cache/clear
```
Remove todos os dados do cache (só em desenvolvimento).

## Como o Sistema Funciona

1. **Cliente faz uma consulta** → API recebe a requisição
2. **Verifica rate limiting** → Se passou do limite, bloqueia
3. **Analisa complexidade** → Se muito complexa, bloqueia
4. **Procura no cache** → Se encontrar, retorna rapidamente
5. **Se não estiver no cache** → Busca no banco de dados
6. **Salva no cache** → Para próximas consultas serem mais rápidas
7. **Retorna resultado** → Cliente recebe os dados

## Tecnologias Usadas

- **Node.js**: Ambiente de execução JavaScript
- **Apollo Server**: Servidor GraphQL
- **Express.js**: Framework web
- **GraphQL**: Linguagem de consulta
- **node-cache**: Sistema de cache em memória
- **express-rate-limit**: Controle de limite de requisições

## Comandos Disponíveis

- `npm start` - Inicia o servidor
- `npm run dev` - Inicia com reinicialização automática

O sistema está pronto para uso e inclui todas as funcionalidades de um sistema de consórcio básico com performance otimizada e segurança implementada. 