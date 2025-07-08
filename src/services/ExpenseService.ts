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
   * Crea una compra y luego sus detalles marcados con toCreate = true
   */
  async createWithDetails(expense: Expense): Promise<Expense> {
    if (!expense.expense_details) {
      return this.create(expense)
    }

    // Calcular total_kg solo de los detalles a crear
    expense.total_kg = expense.expense_details
      .reduce((sum, d) => sum + (d.weight_kg ?? 0), 0)

    const toCreateExpense = { ...expense }
    delete toCreateExpense.expense_details
    const created = await this.create(toCreateExpense)
    if (!created.id) {
      throw new Error('Error al crear el gasto principal')
    }

    // Crear detalles nuevos
    for (const det of expense.expense_details) {
      if (det.toCreate && !det.toDelete) {
        if (!det.product?.id || !det.person?.id) {
          throw new Error('Producto o persona indefinida en detalle a crear')
        }
        const payload = {
          weight_kg: det.weight_kg,
          productId: det.product.id,
          personId: det.person.id,
        }
        await axios.post(`${this.getUrl()}/${created.id}/expense-details`, payload)
      }
    }
    const expenseDetails = await axios.get(`${this.getUrl()}/${created.id}/expense-details`)
      .then(res => res.data)
    return { ...created, expense_details: expenseDetails }
  }

  /**
   * Actualiza una compra y sus detalles según flags:
   * - toUpdate = true (y toCreate/toDelete = false) => PUT
   * - toCreate = true (y toDelete = false) => POST
   * - toDelete = true => DELETE
   */
  async updateWithDetails(expense: Expense): Promise<Expense> {
    if (!expense.id) {
      throw new Error('ID de la compra indefinido')
    }

    // Procesar detalles
    for (const det of expense.expense_details ?? []) {
      // Eliminar primero los marcados para borrar
      if (det.toCreate && det.toDelete) {
        continue
      }
      // Actualizar los existentes
      if (det.toUpdate && !det.toCreate && !det.toDelete && det.id) {
        if (!det.productId || !det.personId) {
          throw new Error('Producto o persona indefinida en detalle a actualizar')
        }
        const payload = {
          weight_kg: det.weight_kg,
          productId: det.productId,
          personId: det.personId,
        }
        await expenseDetailsService.updatePartial(det.id, payload)
        continue
      }

      if (!det.id) {
        throw new Error('ID de detalle indefinido')
      }

      const isNotDeletedNewDetail = det.id > 0
      const isDeletedDetail = isNotDeletedNewDetail && det.toDelete && !det.toCreate
      if (isDeletedDetail) {
        // Eliminar detalle existente
        await expenseDetailsService.delete(det.id)
        continue
      }

      // Crear nuevos detalles
      if (det.toCreate && !det.toDelete && !det.toUpdate) {
        if (!det.productId || !det.personId) {
          throw new Error('Producto o persona indefinida en detalle a crear')
        }
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
