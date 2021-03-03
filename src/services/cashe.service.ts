import { Inject, CACHE_MANAGER, CacheTTL } from '@nestjs/common';
import { Cache } from 'cache-manager';
export class CashingService {


    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async setValue(key: string, value: string) {
        await this.cacheManager.set(key, value, { ttl: 86400 });
    }
    async delete(user: string) {
        try {
            await this.cacheManager.remove([user]);
        } catch(e) {
            console.log('not removed');
        }
        
    }
    async getValue(key: string) {
        if (!key) {
            return;
        }
        return await this.cacheManager.get(key);
    }
}