# Consórcio GraphQL API

A GraphQL API for managing consortium data including people, plans, and contracted plans.

## Project Structure

```
├── schema.graphql          # GraphQL schema definition
├── package.json           # Project dependencies
├── mock_db.json          # JSON database file
├── src/
│   ├── server.js         # Main Apollo Server setup
│   ├── typeDefs.js       # GraphQL type definitions loader
│   ├── data/
│   │   └── dataService.js # Data access layer
│   └── resolvers/
│       ├── index.js      # Main resolver exports
│       ├── queryResolvers.js    # Query resolvers
│       ├── mutationResolvers.js # Mutation resolvers
│       └── typeResolvers.js     # Type/relationship resolvers
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm run dev
   ```

3. **Access GraphQL Playground**
   Open your browser and go to: `http://localhost:4000`

## GraphQL Schema Overview

### Types
- **Pessoa**: Person entity with basic information
- **Plano**: Consortium plan with credit value, installments, and admin rate
- **PlanoContratado**: Contracted plan linking a person to a plan with payment status
- **StatusPlano**: Enum for plan status (ATIVO, CONTEMPLADO, INADIMPLENTE, QUITADO)

### Key Features
- **Relationships**: Query related data across entities
- **Computed Fields**: Automatic calculation of remaining installments, installment values, and payment progress
- **Comprehensive Queries**: Multiple ways to filter and search data
- **Full CRUD Operations**: Create, read, update, and delete for all entities
- **Statistics**: Built-in analytics for dashboard purposes
- **🗃️ Pagination**: Cursor-based and offset-based pagination for all list queries
- **🗄️ Cache System**: Intelligent caching with automatic invalidation
- **🚫 Rate Limiting**: Multiple layers of request limiting for security and performance
- **📊 Monitoring**: Health checks and real-time metrics

## Example Queries

### 1. Get All People (with Pagination)
```graphql
query {
  pessoas(pagination: { page: 1, limit: 10 }) {
    edges {
      node {
        id
        nome
        cpf
        email
        telefone
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      totalCount
      currentPage
      totalPages
      startCursor
      endCursor
    }
  }
}
```

### 1b. Get People with Cursor-based Pagination
```graphql
query {
  pessoas(pagination: { first: 5, after: "cursor_value" }) {
    edges {
      node {
        id
        nome
        email
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
      totalCount
    }
  }
}
```

### 2. Get Person with Their Contracted Plans
```graphql
query {
  pessoa(id: "1") {
    nome
    email
    planosContratados {
      id
      status
      parcelasPagas
      progressoPagamento
      plano {
        nome
        valorCredito
        parcelas
      }
    }
  }
}
```

### 3. Get Plans with Credit Value Filter (with Pagination)
```graphql
query {
  planosPorValorCredito(
    min: 50000, 
    max: 200000,
    pagination: { page: 1, limit: 5 }
  ) {
    edges {
      node {
        id
        nome
        valorCredito
        parcelas
        taxaAdmPercentual
      }
      cursor
    }
    pageInfo {
      hasNextPage
      totalCount
      currentPage
    }
  }
}
```

### 4. Get Contracted Plans by Status
```graphql
query {
  planosContratadosPorStatus(status: ATIVO) {
    id
    pessoa {
      nome
      email
    }
    plano {
      nome
      valorCredito
    }
    parcelasPagas
    parcelasRestantes
    valorParcela
    progressoPagamento
  }
}
```

### 5. Get Statistics
```graphql
query {
  estatisticasGerais {
    totalPessoas
    totalPlanos
    totalPlanosContratados
    planosAtivos
    planosContemplados
    planosInadimplentes
    planosQuitados
    valorTotalCredito
    valorTotalArrecadado
  }
}
```

## Example Mutations

### 1. Create a New Person
```graphql
mutation {
  criarPessoa(input: {
    nome: "Maria Santos"
    cpf: "123.456.789-01"
    email: "maria.santos@example.com"
    telefone: "+55 11 98765-4321"
  }) {
    id
    nome
    email
  }
}
```

### 2. Create a New Plan
```graphql
mutation {
  criarPlano(input: {
    nome: "Consórcio Novo Auto"
    valorCredito: 75000
    parcelas: 60
    taxaAdmPercentual: 16
  }) {
    id
    nome
    valorCredito
    parcelas
    taxaAdmPercentual
  }
}
```

### 3. Contract a Plan
```graphql
mutation {
  contratarPlano(input: {
    pessoaId: "1"
    planoId: "101"
    dataContratacao: "2024-01-15"
  }) {
    id
    pessoa {
      nome
    }
    plano {
      nome
    }
    status
    dataContratacao
  }
}
```

### 4. Pay an Installment
```graphql
mutation {
  pagarParcela(id: "1001") {
    id
    parcelasPagas
    parcelasRestantes
    progressoPagamento
    status
  }
}
```

### 5. Update Plan Status
```graphql
mutation {
  atualizarStatusPlano(id: "1001", status: CONTEMPLADO) {
    id
    status
    pessoa {
      nome
    }
    plano {
      nome
    }
  }
}
```

## 🚀 Performance & Security Features

### 🗄️ Caching System
The API implements intelligent caching with automatic invalidation:

- **Static Cache**: 5-minute TTL for individual entity queries
- **Pagination Cache**: 2-minute TTL for paginated results
- **Auto-invalidation**: Cache is cleared when data is modified via mutations

#### Cache Headers
```bash
# First request - Cache Miss
📋 Cache miss for: pessoas:{"pagination":{"page":1,"limit":10}}

# Second request - Cache Hit  
📋 Cache hit for: pessoas:{"pagination":{"page":1,"limit":10}}
```

### 🚫 Rate Limiting
Multiple layers of protection:

1. **General Limit**: 100 requests per IP per 15 minutes
2. **Mutation Limit**: 20 mutations per IP per 5 minutes  
3. **Complex Query Limit**: 50 complex queries per IP per 10 minutes
4. **Query Complexity Analysis**: Blocks overly complex queries (max complexity: 30)

#### Rate Limit Response Headers
```http
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1640995200
```

### 📊 Monitoring Endpoints

#### Health Check
```bash
GET /health
```
Returns server status, cache statistics, and memory usage.

#### Cache Statistics (Development)
```bash
GET /cache/stats
```
Returns detailed cache hit/miss statistics.

#### Clear Cache (Development)
```bash
POST /cache/clear
```
Manually clears all cache entries.

### 🛡️ Security Features
- **Helmet**: Security headers
- **CORS**: Configurable cross-origin resource sharing
- **Query Complexity Analysis**: Prevents resource-intensive queries
- **Request Size Limiting**: 10MB max request size

## Data Model

### Database Fields vs GraphQL Fields
The API automatically converts between database field names (snake_case) and GraphQL field names (camelCase):

- `valor_credito` ↔ `valorCredito`
- `taxa_adm_percentual` ↔ `taxaAdmPercentual`
- `data_contratacao` ↔ `dataContratacao`
- `parcelas_pagas` ↔ `parcelasPagas`
- `pessoa_id` ↔ `pessoaId`
- `plano_id` ↔ `planoId`

### Computed Fields
- `parcelasRestantes`: Calculated as `total_parcelas - parcelas_pagas`
- `valorParcela`: Calculated as `(valor_credito * (1 + taxa_adm_percentual/100)) / parcelas`
- `progressoPagamento`: Calculated as `(parcelas_pagas / total_parcelas) * 100`

## Development Commands

- `npm start`: Start the production server
- `npm run dev`: Start the development server with auto-reload
- `npm test`: Run tests (placeholder for now)

## Technologies Used

- **Apollo Server 4**: GraphQL server implementation
- **GraphQL**: Query language and runtime
- **Express.js**: Web application framework
- **Node.js**: JavaScript runtime
- **ES Modules**: Modern JavaScript module system
- **express-rate-limit**: Rate limiting middleware
- **node-cache**: In-memory caching solution
- **helmet**: Security middleware for HTTP headers
- **cors**: Cross-Origin Resource Sharing support

## Next Steps

1. **Database Integration**: Replace JSON file with a real database (PostgreSQL, MongoDB, etc.)
2. **Authentication**: Add user authentication and authorization
3. **Validation**: Add input validation and error handling
4. **Testing**: Add unit and integration tests
5. **Advanced Caching**: Implement Redis for distributed caching
6. **Subscriptions**: Add real-time updates with GraphQL subscriptions
7. **Docker**: Containerize the application
8. **CI/CD**: Set up continuous integration and deployment
9. **Observability**: Add structured logging and metrics (Prometheus, Grafana)
10. **API Versioning**: Implement GraphQL schema versioning strategy

## 📋 Additional Documentation

- [**Cache & Rate Limiting Guide**](./CACHE_AND_RATE_LIMIT.md) - Detailed documentation about performance and security features 