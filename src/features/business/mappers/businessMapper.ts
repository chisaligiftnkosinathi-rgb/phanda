/**
 * Business Mapper
 *
 * Adapts raw DTOs from the API into strictly typed models for the UI.
 */

import type { BusinessProjection } from '../types';

export function mapBusiness(dto: any): BusinessProjection {
  return {
    id: dto.id,
    overview: dto.overview || {
      legalName: '',
      tradingName: '',
    },
    branding: dto.branding || {},
    contacts: dto.contacts || {
      email: '',
      phone: '',
    },
    visibility: dto.visibility || {
      isPublic: false,
      searchable: false,
      showOperatingHours: false,
      showLocation: false,
    },
    banking: dto.banking || {
      accountName: '',
      accountNumber: '',
      bankName: '',
      branchCode: '',
      accountType: 'checking',
      verified: false,
    },
    status: dto.status || 'pending',
    createdAt: dto.createdAt || new Date().toISOString(),
    updatedAt: dto.updatedAt || new Date().toISOString(),
  };
}
