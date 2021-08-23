import { AxiosErrorWithMessage, HttpDataQuery, HttpDataSource } from './types'
import { DataSourceTypes } from '../enums'
import { StringTuple } from '@/types'
import {
  isArray,
  isEmpty,
  isEqual, isFunction, isNull, isString, isUndefined,
} from 'lodash'
import URI from 'urijs'
import axios, { AxiosError, AxiosRequestConfig, Method } from 'axios'
import pick from 'lodash/pick'
import type { AbstractQueryService, QueryResponse } from '../types'
import ApiResponse from '@/features/api/ApiResponse'

class QueryService implements AbstractQueryService {
  public dataSource: HttpDataSource | undefined;

  public queryResult: any = {
    data: {},
    metadata: {},
  };

  public error?: AxiosError

  public stateDataQuery: HttpDataQuery | undefined

  public options?: {
    queryParams?: {
      url?: string,
    }
  }

  constructor({ dataSource }: { dataSource: HttpDataSource | undefined }) {
    this.dataSource = dataSource
  }

  get dataQuery(): HttpDataQuery {
    if (!this.stateDataQuery) throw Error('No data query present')

    return this.stateDataQuery
  }

  public setQuery(dataQuery: HttpDataQuery) {
    this.stateDataQuery = dataQuery

    return this
  }

  public setOptions(options: object) {
    this.options = options

    return this
  }

  public async runQuery() {
    const requestParams: AxiosRequestConfig = {}
    requestParams.method = this.getMethod()
    try {
      requestParams.url = this.getUrl()
    } catch (error) {
      this.error = error

      return this
    }
    requestParams.headers = this.getHeaders()
    requestParams.data = this.getBody()

    try {
      this.queryResult = await axios(requestParams)
    } catch (error) {
      this.error = error
    }

    return this
  }

  public toJson() {
    let data = {}

    if (this.queryResult && this.queryResult?.data) {
      data = this.queryResult.data
    }

    const metadata = pick(this.queryResult, ['headers', 'config'])
    const response: QueryResponse = {
      data,
      metadata,
      dataSourceType: DataSourceTypes.http,
    }

    return response
  }

  public async toApiResponse() {
    if (this.error) {
      let message = ''
      let metadata = {}

      if (isFunction(this.error.toJSON)) {
        message = (this.error.toJSON() as AxiosErrorWithMessage).message
        metadata = this.error.toJSON()
      } else if (isString(this.error.message)) {
        message = this.error.message
        metadata = this.error
      } else if (isString(this.error)) {
        message = this.error
      }

      return ApiResponse.withError(message, { metadata })
    }

    return ApiResponse.withData(this.toJson())
  }

  private getMethod(): Method | undefined {
    if (this.dataQuery?.options?.method) return this.dataQuery.options.method
    if (this.dataSource?.options?.method) return this.dataSource.options.method

    return 'GET'
  }

  private getHeaders(): {[name: string]: string} {
    const defaultHeaders: StringTuple[] = []
    const dataQueryHeaders = this.dataQuery?.options?.headers || []
    const dataSourceHeaders = this.dataSource?.options?.headers || []
    const cookieHeaders = this.getCookieHeaders()

    const headers = [
      ...defaultHeaders,
      ...dataQueryHeaders,
      ...dataSourceHeaders,
      cookieHeaders,
    ]

    return Object.fromEntries(
      (headers)
        // Replace bindings
        .map(([key, value]) => [this.replaceBindings(key), this.replaceBindings(value)])
        // Remove empty key values
        .filter(([key]) => key !== '')
        // Remove empty values
        .filter((row) => !isEmpty(row)),
    )
  }

  private getCookieHeaders(): StringTuple | [] {
    const cookies = (this.dataQuery?.options?.cookies || [])
      .filter((row) => !isUndefined(row) && !isNull(row) && isArray(row) && !isEqual(row, ['', '']))
      .map((row) => `${row[0]}=${row[1]}`)

    if (cookies.length === 0) return []

    return ['Cookie', cookies.join('; ')]
  }

  private getUrl(): string | undefined {
    let url

    if (this.dataSource && this.dataSource.options.baseUrl) {
      url = URI(this.dataSource.options.baseUrl).pathname(this.replaceBindings(this.dataQuery.options.url))
    } else {
      url = URI(this.replaceBindings(this.dataQuery.options.url))
    }

    return URI.decode(url.toString())
  }

  private getBody(): {} {
    let body = this.dataQuery?.options?.body

    if (!body || body.length === 0) return {}

    body = body.map(([key, value]) => ([this.replaceBindings(key), this.replaceBindings(value)]))

    return Object.fromEntries(body)
  }

  private replaceBindings(input?: string): string {
    if (isUndefined(input)) return ''

    // Try and replace the binded values with values from the options
    if (this.options?.queryParams) {
      const queryParams = Object.entries(this.options.queryParams)

      if (queryParams.length > 0) {
        queryParams.forEach(([boundKey, boundValue]) => {
          const regex = new RegExp(`{{${boundKey}}}`)
          input = input?.replace(regex, boundValue)
        })
      }
    }

    return input
  }
}

export default QueryService
