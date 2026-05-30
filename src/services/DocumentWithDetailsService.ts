import { ApiService } from './ApiService'
import { httpClient } from './httpClient'
import { extractErrorInfo } from '../utils/error'
import { PaginatedResponse } from '../types/PaginatedResponse'
import { DocumentFilters } from '../types/DocumentFilters'

export type DocumentDetailFlags = {
  toCreate?: boolean
  toUpdate?: boolean
  toDelete?: boolean
}

export interface DocumentWithDetailsConfig {
  endpoint: string
  payloadDetailsKey: string
  entityDetailsKey: string
  entityLabel: string
}

export class DocumentWithDetailsService<
  TParent extends { id?: number; version?: number; date?: string },
  TDetail extends DocumentDetailFlags & { id?: number; weight_kg?: number; productId?: number; personId?: number },
> extends ApiService<TParent> {
  constructor(private readonly cfg: DocumentWithDetailsConfig) {
    super(cfg.endpoint)
  }

  async createWithDetails(parent: TParent): Promise<TParent> {
    const parentWithDetails = parent as TParent & Partial<Record<string, unknown>>
    const details = (parentWithDetails[this.cfg.entityDetailsKey] as TDetail[] | undefined) ?? []

    if (details.length === 0) {
      throw new Error(`El ${this.cfg.entityLabel} debe tener al menos un detalle`)
    }

    const payloadDetails = details.map((det) => ({
      weight_kg: det.weight_kg,
      productId: det.productId,
      personId: det.personId,
    }))

    const payload: Record<string, unknown> = {
      date: parent.date,
      [this.cfg.payloadDetailsKey]: payloadDetails,
    }

    return this.handleResponse<TParent>(httpClient.post(this.getUrl('with-details'), payload))
  }

  async updateWithDetails(parent: TParent): Promise<TParent> {
    if (!parent.id) {
      throw new Error(`ID del ${this.cfg.entityLabel} indefinido`)
    }

    if (parent.version === undefined) {
      console.warn('Falta version en payload, usando 1 pero es probable que devuelva 409')
    }

    const parentWithDetails = parent as TParent & Partial<Record<string, unknown>>
    const details = ((parentWithDetails[this.cfg.entityDetailsKey] as TDetail[] | undefined) ?? [])
      .filter((d) => !d.toDelete)
      .map((d) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { toCreate, toUpdate, toDelete, ...cleanDetail } = d
        if (cleanDetail.id && cleanDetail.id < 0) {
          delete cleanDetail.id
        }
        return cleanDetail
      })

    const payload: Record<string, unknown> = {
      id: parent.id,
      version: parent.version ?? 1,
      date: parent.date,
      [this.cfg.payloadDetailsKey]: details,
    }

    try {
      return await this.handleResponse<TParent>(httpClient.put(this.getUrl('with-details'), payload))
    } catch (error: unknown) {
      const { message: msg, status } = extractErrorInfo(error)
      if (status === 409) {
        throw new Error(
          msg || 'Este registro fue modificado por otro usuario. Por favor recarga y vuelve a intentarlo.',
          { cause: error },
        )
      }
      this.handleError(error, `Error updating ${this.cfg.endpoint} with details`)
    }
  }

  async getByIdWithDetails(id: number | string): Promise<TParent> {
    const params = new URLSearchParams({
      filter: JSON.stringify({ include: [{ relation: this.cfg.entityDetailsKey }] }),
    })
    return this.handleResponse<TParent>(
      httpClient.get(`${this.getUrl(id.toString())}?${params}`),
    )
  }

  async getAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<TParent>> {
    return this.getPaginated(page, limit)
  }

  async getAllPaginatedWithDetails(page: number = 1, limit: number = 10): Promise<PaginatedResponse<TParent>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        filter: JSON.stringify({
          include: [{ relation: this.cfg.entityDetailsKey }],
          order: ['date DESC'],
        }),
      })

      return await this.handleResponse<PaginatedResponse<TParent>>(
        httpClient.get(`${this.getUrl()}?${params.toString()}`),
      )
    } catch (error) {
      this.handleError(error, `Error getting paginated ${this.cfg.endpoint} with details`)
    }
  }

  async getAllPaginatedFiltered(
    filters: DocumentFilters,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<TParent>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (filters.activeDate) {
        if (filters.startDate) {
          params.append('startDate', filters.startDate)
        }
        if (filters.endDate) {
          params.append('endDate', filters.endDate)
        }
      }

      if (filters.personId) {
        params.append('personId', filters.personId)
      }

      if (filters.productId) {
        params.append('productId', filters.productId)
      }

      return await this.handleResponse<PaginatedResponse<TParent>>(
        httpClient.get(`${this.getUrl()}/filtered?${params.toString()}`),
      )
    } catch (error) {
      this.handleError(error, `Error getting paginated ${this.cfg.endpoint} with details`)
    }
  }
}
