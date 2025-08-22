import NodeCache from 'node-cache';

class CacheService {
    constructor() {
        // Cache com TTL de 5 minutos (300 segundos) e verificação a cada 60 segundos
        this.cache = new NodeCache({
            stdTTL: 300,
            checkperiod: 60,
            useClones: false
        });

        // Cache separado para queries de paginação com TTL menor
        this.paginationCache = new NodeCache({
            stdTTL: 120,
            checkperiod: 30,
            useClones: false
        });

        console.log('🗄️ Cache service initialized');
    }

    // Cache para dados estáticos que mudam pouco
    getStaticData(key) {
        return this.cache.get(key);
    }

    setStaticData(key, value, ttl = 300) {
        return this.cache.set(key, value, ttl);
    }

    // Cache para queries de paginação
    getPaginatedData(key) {
        return this.paginationCache.get(key);
    }

    setPaginatedData(key, value, ttl = 120) {
        return this.paginationCache.set(key, value, ttl);
    }

    // Gerar chave de cache baseada nos parâmetros da query
    generateCacheKey(queryName, args = {}) {
        const sortedArgs = Object.keys(args)
            .sort()
            .reduce((result, key) => {
                result[key] = args[key];
                return result;
            }, {});

        return `${queryName}:${JSON.stringify(sortedArgs)}`;
    }

    // Limpar cache quando dados são modificados
    invalidatePattern(pattern) {
        const keys = this.cache.keys();
        const paginationKeys = this.paginationCache.keys();

        keys.forEach(key => {
            if (key.includes(pattern)) {
                this.cache.del(key);
            }
        });

        paginationKeys.forEach(key => {
            if (key.includes(pattern)) {
                this.paginationCache.del(key);
            }
        });
    }

    // Limpar cache específico por entidade
    invalidateEntityCache(entityType) {
        this.invalidatePattern(entityType);
        // Também limpar estatísticas quando qualquer entidade muda
        this.invalidatePattern('estatisticas');
    }

    // Obter estatísticas do cache
    getStats() {
        return {
            staticCache: this.cache.getStats(),
            paginationCache: this.paginationCache.getStats()
        };
    }

    // Limpar todo o cache
    clearAll() {
        this.cache.flushAll();
        this.paginationCache.flushAll();
        console.log('🗑️ All cache cleared');
    }
}

// Export singleton instance
export const cacheService = new CacheService(); 