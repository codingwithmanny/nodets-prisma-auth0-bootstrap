export interface QueryUserFilters {
  query?: string | null;
  take?: number;
  skip?: number;
  orderBy?: string;
  sort?: string;
  findBy?: 'id' | 'name' | 'display' | 'email' | 'providerId';
}

export interface User {
  id?: string;
  name?: string;
  display?: string;
  providerId?: string;
  createdAt?: string;
  updatedAt?: Date;
}
