export interface DashboardResult {
    date: string;
    weight_kg: number;
    type: "Compra" | "Gasto";
}

export interface ProductsResults extends DashboardResult {
  productId: number;
}

export interface SuppliersResults extends DashboardResult {
  personId: number;
}
