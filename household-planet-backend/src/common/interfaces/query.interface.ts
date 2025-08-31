export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface SearchQuery extends PaginationQuery {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductQuery extends SearchQuery {
  category?: number;
  featured?: boolean;
  active?: boolean;
}

export interface ActivityQuery extends PaginationQuery {
  userId?: number;
  action?: string;
  search?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}

export interface BulkOperationResult<T = any> {
  count: number;
  items?: T[];
  errors?: Array<{ item: string; error: string }>;
}