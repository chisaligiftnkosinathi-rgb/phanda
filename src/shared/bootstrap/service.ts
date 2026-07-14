import { AXIOS_INSTANCE as client } from '@/shared/api/client';
import { BootstrapResponse } from './types';

export const bootstrapService = {
    get: async (): Promise<BootstrapResponse> => {
        const response = await client.get<BootstrapResponse>('/api/v1/bootstrap');
        return response.data;
    }
};
