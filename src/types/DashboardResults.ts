export interface DashboardResult {
    date: string;
    weight_kg: number;
    type: "Compra" | "Gasto";
}

/** Fila del reporte de una persona: cada entrada es una transacción vinculada a un producto. */
export interface PersonReportRow extends DashboardResult {
  productId: number;
}

/** Fila del reporte de un producto: cada entrada es una transacción vinculada a un proveedor. */
export interface ProductReportRow extends DashboardResult {
  personId: number;
  personName?: string;
}
