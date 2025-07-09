import axios from 'axios'
import Expense from '../types/Expense'
import { PaginatedResponse } from '../types/PaginatedResponse'
import { ApiService } from './ApiService'
import { expenseDetailsService } from './ExpenseDetailsService'

/**
 * Servicio para manejar creación y actualización de compras con detalles
 * Respecta los flags toCreate, toUpdate y toDelete en cada detalle
 */
export class ExpenseService extends ApiService<Expense> {
  constructor() {
    super('expenses')
  }

  /**
   * Crea un gasto y luego sus detalles
   * Acepta tanto el formato interno como el formato simplificado
   */
  async createWithDetails(expense: Expense): Promise<Expense> {
    if (!expense.expense_details) {
      return this.create(expense)
    }
    const expenseDetails = []
    for (const det of expense.expense_details) {
      const detail = {
        weight_kg: det.weight_kg,
        productId: det.productId,
        personId: det.personId,
      }
      expenseDetails.push(detail)
    }
    const response = await axios.post(
      this.getUrl() + '/with-details', {
      date: expense.date,
      expenseDetails
    });
    return response.data as Expense;
  }

  /**
   * Actualiza una compra y sus detalles según flags:
   * - toUpdate = true => PUT
   * - toCreate = true => POST
   * - toDelete = true => DELETE
   */
  async updateWithDetails(expense: Expense): Promise<Expense> {
    if (!expense.id) {
      throw new Error('ID de la compra indefinido')
    }
    for (const det of expense.expense_details ?? []) {
      if (!det.productId || !det.personId) {
        throw new Error('Producto o persona indefinida en detalle a actualizar')
      }
      if (det.toDelete && det.id) {
        await expenseDetailsService.delete(det.id)
      } else if (det.toUpdate && det.id) {
        const payload = {
          weight_kg: det.weight_kg,
          productId: det.productId,
          personId: det.personId,
        }
        await expenseDetailsService.updatePartial(det.id, payload)
      } else if (det.toCreate) {
        const payload = {
          weight_kg: det.weight_kg,
          productId: det.productId,
          personId: det.personId,
        }
        await axios.post(`${this.getUrl()}/${expense.id}/expense-details`, payload)
      }
    }
    // Recalcular total_kg de todos los detalles conservados o nuevos
    expense.total_kg = (expense.expense_details ?? [])
      .filter((d) => !d.toDelete)
      .reduce((sum, d) => sum + (d.weight_kg ?? 0), 0)
    const toUpdateExpense = { ...expense }
    delete toUpdateExpense.expense_details
    delete toUpdateExpense.id
    const updateRes = await axios.put(
      `${this.getUrl()}/${expense.id}`,
      toUpdateExpense
    )
    const updatedExpense: Expense = updateRes.data
    return updatedExpense
  }

  async deleteWithDetails(id: number): Promise<void> {
    try {
      await axios.delete(`${this.getUrl()}/${id}/expense-details`)
    } catch (error) {
      this.handleError(error, 'Error deleting expense with details')
    }
  }

  // Método específico para obtener gastos paginados
  async getAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Expense>> {
    return this.getPaginated(page, limit)
  }

  async getAllPaginatedWithDetails(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Expense>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        filter: JSON.stringify({
          include: [{ relation: 'expense_details' }],
          order: ['date DESC'],
        }),
      })
      return await this.handleResponse<PaginatedResponse<Expense>>(
        axios.get(`${this.getUrl()}?${params.toString()}`)
      )
    } catch (error) {
      this.handleError(error, 'Error getting paginated expenses with details')
    }
  }
}

export const expenseService = new ExpenseService()
