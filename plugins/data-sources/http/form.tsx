import { joiResolver } from '@hookform/resolvers/joi'
import { schema } from './schema'
import { useApi } from '@/src/hooks'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import Button from '@/components/Button'
import React, { useState } from 'react'
import TextField from '@/components/TextField'

export interface IFormFields {
  id?: number;
  name: string;
  options: {
    baseUrl: string;
    headers: string;
    // headers: {[key: string]: string}[] // @todo: implement key value editor
  }
  type: 'http';
}

function Form({ data }: { data?: IFormFields }) {
  const whenCreating = !data?.id
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const api = useApi()

  const onSubmit = async (formData: IFormFields) => {
    setIsLoading(true)

    let response
    try {
      if (whenCreating) {
        response = await api.createDataSource(formData)
      } else {
        if (!data?.id) {
          setIsLoading(false)

          return
        }

        response = await api.updateDataSource(data?.id, formData)
      }
    } catch (error) {
      setIsLoading(false)
    }

    setIsLoading(false)

    if (response && response.ok && whenCreating) {
      router.push(`/data-sources/${response.data.id}`)
    }
  }

  const { register, handleSubmit, formState } = useForm<IFormFields>({
    resolver: joiResolver(schema),
  })

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="hidden"
            {...register('type')}
            defaultValue='http'
          />
          <TextField
            placeholder="Admin microservice API"
            defaultValue={data?.name}
            isLoading={isLoading}
            formState={formState}
            register={register('name')}
          />
          <TextField
            placeholder="https://jsonplaceholder.typicode.com/users"
            defaultValue={data?.options?.baseUrl}
            isLoading={isLoading}
            formState={formState}
            register={register('options.baseUrl')}
          />
          <TextField
            placeholder="[]"
            defaultValue={data?.options?.headers}
            isLoading={isLoading}
            formState={formState}
            register={register('options.headers')}
          />
          {/* <SelectField
            defaultValue={data?.type}
            options={availableDataSourceTypes}
            formState={formState}
            register={register('type')}
          /> */}
          <Button className="mt-4" type="submit" disabled={isLoading}>
            {whenCreating ? 'Create' : 'Update'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Form
