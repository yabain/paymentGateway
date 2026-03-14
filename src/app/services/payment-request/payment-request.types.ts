export interface PaymentRequestQuery {
  page?: number;
  limit?: number;
}

export interface PaymentRequestItem {
  _id: string;
  transactionId?: any;
  userId?: any;
  status?: 'pending' | 'success' | 'canceled' | 'failed' | string;
  amount?: number;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentRequestPagination {
  currentPage?: number;
  limit?: number;
  totalItems?: number;
  totalPages?: number;
  hasNextPage?: boolean;
}

export interface PaymentRequestListResponse {
  data?: PaymentRequestItem[];
  pagination?: PaymentRequestPagination;
}

