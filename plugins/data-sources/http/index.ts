import { HttpDataQuery } from './types'
import { flatten } from 'lodash'
import { schema } from './schema'
// import QueryService from './QueryService'
import formComponent from './form'
import queryEditorComponent from './editor'

const http = {
  id: 'http',
  name: 'HTTP',
  description: 'Http data source',
  queryEditorComponent,
  formComponent,
  schema,
  // queryService: QueryService,
  queryParams: (dataQuery: HttpDataQuery): string[] => flatten([
    dataQuery?.options?.url,
    ...dataQuery?.options?.body || [],
    ...dataQuery?.options?.headers || [],
    ...dataQuery?.options?.cookies || [],
  ]),
}

export default http
