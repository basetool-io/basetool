import { DataSource } from '@prisma/client'
import { Method } from 'axios'
import type { StringTuple } from '@/types'
import type DataQuery from '@/types/app-state/DataQuery'

export type AxiosErrorWithMessage = {
  message: string
}
export type HttpBodyType = 'JSON' | 'raw' | 'urlEncodedForm' | 'formData' | 'binary'

export interface HttpDataSource extends DataSource {
  options: {
    baseUrl: string
    headers: StringTuple[]
    method: Method
    body: StringTuple[]
  }
}

export interface HttpDataQuery extends DataQuery implements DataQuery {
  options: {
    url: string
    headers: StringTuple[]
    body: StringTuple[]
    urlParams: StringTuple[]
    cookies: StringTuple[]
    bodyType: HttpBodyType
    method: Method
    runOnPageLoad: boolean
  }
}
