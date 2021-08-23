import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/solid'
import { Column, Record } from '@/components/fields/types'
import { SparklesIcon } from '@heroicons/react/outline'
import { Views } from '@/components/fields/enums'
import { getField } from '@/components/fields/factory'
import { isFunction } from 'lodash'
import { joiResolver } from '@hookform/resolvers/joi'
import { makeField } from '@/components/fields'
import { toast } from 'react-toastify'
import { updatedDiff } from 'deep-object-diff'
import {
  useAddRecordMutation,
  useUpdateRecordMutation,
} from '@/features/records/records-api-slice'
import { useBoolean } from 'react-use'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import ApiResponse from '@/src/services/ApiResponse'
import Joi, { ObjectSchema } from 'joi'
import Link from 'next/link'
import MenuItem from '@/components/fields/common/MenuItem'
import React, { useEffect, useMemo, useState } from 'react'
import isUndefined from 'lodash/isUndefined'
import logger from '@/src/logger'

const makeSchema = async (record: Record, columns: Column[]) => {
  const schema: { [columnName: string]: any } = {}

  // eslint-disable-next-line no-restricted-syntax
  for (const column of columns) {
    let fieldSchema

    try {
      // eslint-disable-next-line no-await-in-loop
      fieldSchema = (await import(`@/components/fields/${column.fieldType}/schema`)).default
    } catch (error) {
      logger.info('Error importing field schema->', error)
      fieldSchema = Joi.any()
    }
    if (isFunction(fieldSchema)) {
      schema[column.name] = fieldSchema(record, column)
    } else if (!isUndefined(fieldSchema)) {
      schema[column.name] = fieldSchema
    }
  }

  return Joi.object(schema)
}

// @todo: we should initialize the empty record based on the default values
const Form = ({
  record,
  columns,
  isCreating,
}: {
  record: Record;
  columns: Column[];
  isCreating?: boolean;
}) => {
  isCreating = !isUndefined(isCreating) // default to false
  const router = useRouter()
  const [isLoading, setIsLoading] = useBoolean(false)
  const [schema, setSchema] = useState<ObjectSchema>(Joi.object())

  const setTheSchema = async () => {
    setSchema(await makeSchema(record, columns))
  }

  useEffect(() => {
    setTheSchema()
  }, [record, columns])

  const {
    register, handleSubmit, formState, setValue, getValues, watch,
  } = useForm({
    defaultValues: record,
    resolver: joiResolver(schema),
  })

  const formData = watch()
  const diff = updatedDiff(record, formData)

  const showLink = useMemo(
    () => `/new/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/`,
    [router.query.dataSourceId, router.query.tableName],
  )

  const [addRecord, { isLoading: isAdding }] = useAddRecordMutation()
  const [updateRecord, { isLoading: isUpdating }] = useUpdateRecordMutation()

  const onSubmit = async (formData: any) => {
    let response

    setIsLoading(true)
    try {
      if (isCreating) {
        response = await addRecord({
          dataSourceId: router.query.dataSourceId as string,
          tableName: router.query.tableName as string,
          body: {
            record: formData,
          },
        })

        setIsLoading(false)

        if (response && 'data' in response) {
          const apiResponse: ApiResponse = response.data

          const { data } = apiResponse
          const { id } = data
          if (apiResponse.ok) {
            router.push(
              `/new/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/${id}`,
            )
          }
        }
      } else if (
        router.query.dataSourceId
        && router.query.tableName
        && record.id
      ) {
        const response = await updateRecord({
          dataSourceId: router.query.dataSourceId as string,
          tableName: router.query.tableName as string,
          recordId: record.id.toString(),
          body: {
            changes: diff,
          },
        })

        if ('data' in response && response?.data?.ok) {
          // @todo: make these updates into a pretty message
          const updates = JSON.stringify(diff)
          toast.success(`Updated: ${updates}`)
        }

        router.push(showLink)
      } else {
        toast.error('Not enough data.')
      }
    } catch (error) {
      setIsLoading(false)
    }

    setIsLoading(false)
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="flex justify-between">
          <div>
            <div className="flex">
              {formState.isDirty || (
                <span className="text-xs text-gray-600">
                  <SparklesIcon className="inline h-4" /> Clean
                </span>
              )}
              {formState.isDirty && (
                <>
                  {formState.isValid && (
                    <span className="text-xs text-green-600">
                      <CheckCircleIcon className="inline h-4" /> Valid
                    </span>
                  )}
                  {formState.isValid || (
                    <span className="text-xs text-red-600">
                      <XCircleIcon className="inline h-4" /> Invalid
                    </span>
                  )}
                </>
              )}
              {isLoading && (
                <span className="text-xs text-gray-600">
                  <ClockIcon className="inline h-4" /> Loading
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-4">
            <Link href={showLink} passHref>
              <MenuItem>Back</MenuItem>
            </Link>
            <div className="flex justify-between">
              <MenuItem
                onClick={() => {
                  console.log(formState, getValues())
                  handleSubmit(onSubmit)()
                }}
              >
                {isCreating ? 'Create' : 'Save'}
              </MenuItem>
            </div>
          </div>
        </div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            {columns
              && columns.map((column: Column) => {
                if (!formData) return null

                const field = makeField({
                  record: formData as Record,
                  column,
                  tableName: router.query.tableName as string,
                })
                let schemaForColumn
                try {
                  schemaForColumn = schema.extract(column.name)
                } catch (error) {}

                const Element = getField(column, Views.edit)

                return (
                  <Element
                    key={column.name}
                    field={field}
                    formState={formState}
                    register={register}
                    setValue={setValue}
                    schema={schemaForColumn}
                  />
                )
              })}
            {isUpdating && 'Is updating'}
            <input type="submit" value="Submit" className="hidden" />
          </form>
        </div>
      </div>

      {/* <pre>{JSON.stringify(diff, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(record, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(formData, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(formState, null, 2)}</pre> */}
    </>
  )
}

export default Form
