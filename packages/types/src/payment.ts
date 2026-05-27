import type { UUID, Timestamp } from "./common";

export type PaymentProvider = "stripe" | "razorpay";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded" | "partially_refunded";

export interface Payment {
  id: UUID;
  subscriptionId: UUID | null;
  companyId: UUID | null;
  seekerId: UUID | null;
  provider: PaymentProvider;
  providerPaymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description: string | null;
  metadata: Record<string, string>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Invoice {
  id: UUID;
  paymentId: UUID;
  invoiceNumber: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  pdfUrl: string | null;
  issuedAt: Timestamp;
}
