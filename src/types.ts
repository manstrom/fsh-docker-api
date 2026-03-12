export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  horsepower: number;
  for_sale: boolean;
  created_at: string;
}

export interface CreateCarBody {
  brand: string;
  model: string;
  year: number;
  color: string;
  horsepower: number;
  for_sale?: boolean;
}

export interface UpdateCarBody {
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  horsepower?: number;
  for_sale?: boolean;
}