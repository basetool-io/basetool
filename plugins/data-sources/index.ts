import { DataSourcePlugin } from './types'
import { ElementType, useEffect, useState } from 'react'
import { ObjectSchema } from 'joi'
// import http from './http'
import postgresql from './postgresql'

const dataSources: DataSourcePlugin[] = [
  postgresql,
  // http,
]

export const getPluginById = (id: string): DataSourcePlugin | undefined => dataSources.find((dataSource) => dataSource.id === id)
export const getEditorComponent = (id: string | undefined): ElementType | undefined => (id ? getPluginById(id)?.queryEditorComponent : undefined)
export const getFormComponent = (id: string): ElementType | undefined => getPluginById(id)?.formComponent
export const getSchema = (id: string): ObjectSchema | undefined => getPluginById(id)?.schema

export const useGetQueryEditor = (id: string | null): DataSourcePlugin | null => {
  const [dataSource, setDataSource] = useState<DataSourcePlugin | null>(null)

  useEffect(() => {
    if (id) {
      const dataSource = getPluginById(id)
      if (dataSource) {
        setDataSource(dataSource)
      }
    }
  }, [id])

  return dataSource
}

export default dataSources
