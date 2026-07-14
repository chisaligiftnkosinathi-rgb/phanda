import { Permission } from '@/features/auth/types';

export class TrustPermissionEngine {
  
  static hasPermission(permissions: Permission[] | undefined, resource: string, action: string): boolean {
    if (!permissions) return false;
    return permissions.some(p => 
      (p.resource === resource || p.resource === '*') && 
      (p.action === action || p.action === '*')
    );
  }

  // ==========================================
  // 1. INTENT PERMISSIONS (Opportunities, Leads)
  // ==========================================

  static canCreateOpportunity(permissions: Permission[] | undefined): boolean {
    return this.hasPermission(permissions, "opportunity", "create");
  }

  static assertCanCreateOpportunity(permissions: Permission[] | undefined) {
    if (!this.canCreateOpportunity(permissions)) {
      throw new Error("NOT_AUTHORIZED_TO_CREATE_OPPORTUNITY");
    }
  }

  static canAcceptOpportunity(permissions: Permission[] | undefined): boolean {
    return this.hasPermission(permissions, "opportunity", "accept");
  }

  static assertCanAcceptOpportunity(permissions: Permission[] | undefined) {
    if (!this.canAcceptOpportunity(permissions)) {
      throw new Error("NOT_AUTHORIZED_TO_ACCEPT_OPPORTUNITY");
    }
  }

  static canCreateLead(permissions: Permission[] | undefined): boolean {
    return this.hasPermission(permissions, "lead", "create");
  }

  static assertCanCreateLead(permissions: Permission[] | undefined) {
    if (!this.canCreateLead(permissions)) {
      throw new Error("NOT_AUTHORIZED_TO_CREATE_LEAD");
    }
  }

  // ==========================================
  // 2. CONVERSION PERMISSIONS (Lead -> Quote -> Invoice)
  // ==========================================

  static canConvertLead(permissions: Permission[] | undefined): boolean {
    return this.hasPermission(permissions, "lead", "convert");
  }

  static assertCanConvertLead(permissions: Permission[] | undefined) {
    if (!this.canConvertLead(permissions)) {
      throw new Error("NOT_AUTHORIZED_TO_CONVERT_LEAD");
    }
  }

  // ==========================================
  // 3. FINANCIAL PERMISSIONS (Quotes, Invoices)
  // ==========================================

  static canGenerateQuote(permissions: Permission[] | undefined): boolean {
    return this.hasPermission(permissions, "quote", "generate");
  }

  static assertCanGenerateQuote(permissions: Permission[] | undefined) {
    if (!this.canGenerateQuote(permissions)) {
      throw new Error("NOT_AUTHORIZED_TO_GENERATE_QUOTE");
    }
  }

  static canSendQuote(permissions: Permission[] | undefined): boolean {
    return this.hasPermission(permissions, "quote", "send");
  }

  static assertCanSendQuote(permissions: Permission[] | undefined) {
    if (!this.canSendQuote(permissions)) {
      throw new Error("NOT_AUTHORIZED_TO_SEND_QUOTE");
    }
  }

  static canCreateInvoice(permissions: Permission[] | undefined): boolean {
    return this.hasPermission(permissions, "invoice", "create");
  }

  static assertCanCreateInvoice(permissions: Permission[] | undefined) {
    if (!this.canCreateInvoice(permissions)) {
      throw new Error("NOT_AUTHORIZED_TO_CREATE_INVOICE");
    }
  }

  static canMarkInvoicePaid(permissions: Permission[] | undefined): boolean {
    return this.hasPermission(permissions, "invoice", "mark_paid");
  }

  static assertCanMarkInvoicePaid(permissions: Permission[] | undefined) {
    if (!this.canMarkInvoicePaid(permissions)) {
      throw new Error("NOT_AUTHORIZED_TO_MARK_INVOICE_PAID");
    }
  }
  
  static canProcessPayment(permissions: Permission[] | undefined): boolean {
    return this.hasPermission(permissions, "payment", "process");
  }

  static assertCanProcessPayment(permissions: Permission[] | undefined) {
    if (!this.canProcessPayment(permissions)) {
      throw new Error("NOT_AUTHORIZED_TO_PROCESS_PAYMENT");
    }
  }
}
