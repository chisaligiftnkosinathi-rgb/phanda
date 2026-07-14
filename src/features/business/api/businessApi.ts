/**
 * Business API Client
 *
 * This will eventually be replaced by the generated OpenAPI client.
 * For now, it provides the required contracts for React Query.
 */

import type { BusinessProjection } from '../types';

export const businessApi = {
  /**
   * Fetch a specific business by ID.
   */
  getBusiness: async (id: string): Promise<BusinessProjection> => {
    // const { data } = await api.get(`/api/v1/business/${id}`);
    // return data;

    // Temporary mock data until the backend implements GET /api/v1/business/{id}
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          overview: {
            legalName: 'Phanda Holdings (Pty) Ltd',
            tradingName: 'Phanda Holdings',
            registrationNumber: '2023/123456/07',
            taxNumber: '9123456789',
            description: 'A platform for building platforms.',
          },
          branding: {
            logoUrl: 'https://via.placeholder.com/150',
            primaryColor: '#000000',
            slogan: 'Empowering the next generation.',
          },
          contacts: {
            email: 'hello@phanda.com',
            phone: '+27 82 123 4567',
            website: 'https://phanda.com',
          },
          visibility: {
            isPublic: true,
            searchable: true,
            showOperatingHours: false,
            showLocation: true,
          },
          banking: {
            accountName: 'Phanda Holdings',
            accountNumber: '1234567890',
            bankName: 'FNB',
            branchCode: '250655',
            accountType: 'checking',
            verified: true,
          },
        });
      }, 800);
    });
  },

  /**
   * Partially update a specific business by ID.
   */
  updateBusiness: async (
    id: string,
    payload: Partial<BusinessProjection>
  ): Promise<BusinessProjection> => {
    // const { data } = await api.patch(`/api/v1/business/${id}`, payload);
    // return data;

    // Temporary mock
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          overview: {
            legalName: 'Phanda Holdings (Pty) Ltd',
            tradingName: 'Phanda Holdings',
            ...payload.overview,
          },
          branding: {
            logoUrl: 'https://via.placeholder.com/150',
            primaryColor: '#000000',
            slogan: 'Empowering the next generation.',
            ...payload.branding,
          },
          contacts: {
            email: 'hello@phanda.com',
            phone: '+27 82 123 4567',
            website: 'https://phanda.com',
            ...payload.contacts,
          },
          visibility: {
            isPublic: true,
            searchable: true,
            showOperatingHours: false,
            showLocation: true,
            ...payload.visibility,
          },
          banking: {
            accountName: 'Phanda Holdings',
            accountNumber: '1234567890',
            bankName: 'FNB',
            branchCode: '250655',
            accountType: 'checking',
            verified: true,
            ...payload.banking,
          },
        });
      }, 800);
    });
  },
};
