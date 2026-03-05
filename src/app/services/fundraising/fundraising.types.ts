export interface FundraisingQuery {
  page?: number;
  limit?: number;
}

export type FundraisingVisibility = 'public' | 'private';

export interface FundraisingItem {
  _id: string;
  title: string;
  description?: string;
  currency?: string;
  targetAmount?: number;
  raisedAmount?: number;
  amountRaised?: number;
  status?: boolean;
  isActive?: boolean;
  visibility?: FundraisingVisibility;
  userId?: string;
  author?: any;
  createdAt?: string;
  startDate?: string;
  endDate?: string;
}

export interface DonationItem {
  _id: string;
  fundraisingId?: string;
  transactionId?: string;
  donorId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  createdAt?: string;
}

export interface PaginatedResponse<T> {
  docs?: T[];
  data?: T[];
  items?: T[];
  totalDocs?: number;
  total?: number;
  page?: number;
  limit?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}
