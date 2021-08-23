import {
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  HStack,
  Select,
} from '@chakra-ui/react'
import { Column, FieldType } from '@/components/fields/types'
import { getColumnOptions } from '@/components/fields'
import { iconForField } from '@/components/fields/utils'
import { isEmpty } from 'lodash'
import { updatedDiff } from 'deep-object-diff'
import {
  useGetColumnsQuery,
  useUpdateColumnsMutation,
} from '@/features/tables/tables-api-slice'
import { useGetTableRecordsQuery } from '@/features/records/records-api-slice'
import { useRouter } from 'next/router'
import Layout from '@/components/layouts/NewAppLayout'
import Link from 'next/link'
import MenuItem from '@/components/fields/common/MenuItem'
import React, { useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'

type ChangesObject = {
  [columnName: string]: {}
}

const ColumnListItem = ({ column, selectedColumn, setColumn }: {column: Column, selectedColumn?: Column, setColumn: (c: Column) => void}) => {
  const IconElement = useMemo(() => iconForField(column), [column.fieldType])

  return (column && (
    <div
      className={classNames(
        'cursor-pointer uppercase text-sm font-semibold',
        { underline: selectedColumn && column.name === selectedColumn.name },
      )}
      onClick={() => setColumn(column)}
    >
      <span className="border p-1 inline-flex justify-center align-middle text-xs w-6 h-6">{<IconElement className="inline h-3" />}</span> {column.name} {column.required && <sup className="text-red-600">*</sup>}
    </div>)
  )
}

const ColumnEditor = ({ column, setColumnOption }: {column: Column, setColumnOption: (c: Column, name: string, value: any) => void}) => {
  const columnOptions = useMemo(() => (column ? getColumnOptions(column) : []), [column])

  return (
    <>
      {!column?.name && 'Please select a column'}
      {column?.name && <div className="space-y-4">
        <div>
          <h3 className="uppercase text-sm font-semibold">{column.name}</h3>
        </div>
        <FormControl id="country">
          <FormLabel>Field Type</FormLabel>
          <Select value={column.fieldType} onChange={(e) => setColumnOption(column, 'fieldType', e.currentTarget.value as FieldType)}>
            <option disabled>Select field type</option>
            {columnOptions && columnOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </Select>
        </FormControl>
        <CheckboxGroup value={column.visibility} onChange={(value) => setColumnOption(column, 'visibility', value)}>
          <HStack>
            <Checkbox value="index">Index</Checkbox>
            <Checkbox value="show">Show</Checkbox>
            <Checkbox value="edit">Edit</Checkbox>
            <Checkbox value="new">New</Checkbox>
          </HStack>
        </CheckboxGroup>
        <FormControl id="required">
          <Checkbox isChecked={column.required === true} onChange={() => setColumnOption(column, 'required', !column.required)}>Required</Checkbox>
        </FormControl>
        <pre>{JSON.stringify(column, null, 2)}</pre>
      </div>}
    </>
  )
}

const FieldsEditor = ({
  dataSourceId,
  tableName,
  columns: initialColumns,
}: {
  dataSourceId: string;
  tableName: string;
  columns: Column[];
}) => {
  const { data, error, isLoading } = useGetTableRecordsQuery({
    dataSourceId,
    tableName,
  })
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [column, setColumn] = useState<Column>()
  const router = useRouter()
  const diff = useMemo(() => updatedDiff(initialColumns, columns), [initialColumns, columns])
  const isDirty = useMemo(() => !isEmpty(diff), [diff])
  const changes: ChangesObject = useMemo(() => Object.fromEntries(Object.entries(diff).map(([columnIndex, changes]: [string, any]) => {
    // get the column
    const column = columns[parseInt(columnIndex, 10)]

    if (!column) return []

    // create the changes object
    const changesObject = {
      ...changes,
      // Force visibility because the diff package does a weird diff on arrays.
      visibility: column.visibility,
    }

    return [column.name, changesObject]
  })), [columns, diff])
  const [
    updateTable, // This is the mutation trigger
    { isLoading: isUpdating }, // This is the destructured mutation result
  ] = useUpdateColumnsMutation()

  const setColumnOption = (column: Column, name: string, value: any) => {
    const newColumns = [...columns]
    const newColumn = {
      ...column,
      [name]: value,
    }
    const index = newColumns.findIndex((c: Column) => c.name === column.name)

    if (index > -1) {
      newColumns[index] = newColumn
      setColumn(newColumn)
      setColumns(newColumns)
    }
  }

  const saveTableSettings = () => {
    updateTable({
      dataSourceId: router.query.dataSourceId as string,
      tableName: router.query.tableName as string,
      body: {
        changes,
      },
    })
  }

  useEffect(() => {
    if (columns.length > 0) setColumn(columns[0])
  }, [])

  return (
    <>
      {isLoading && <div>loading...</div>}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && data?.ok && (
        <>
          <div className="flex flex-col flex-1 overflow-auto">
            <div className="flex justify-between">
              <div className="text-xs inline-flex">
                {isDirty && 'Dirty'}
                {!isDirty && 'Clean'}
              </div>
              <div className="flex justify-end space-x-4">
                <Link
                  href={`/new/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}`}
                  passHref
                >
                  <MenuItem>Back</MenuItem>
                </Link>
                <Button disabled={!isDirty} onClick={saveTableSettings}>Save</Button>
              </div>
            </div>
            <div className="relative flex-1 max-w-full w-full flex">
              <div className="w-1/4 space-y-2 px-2">
                {columns
                  && columns.map((c) => (
                    <ColumnListItem
                      key={c.name}
                      column={c}
                      selectedColumn={column}
                      setColumn={setColumn}
                    />
                  ))}
              </div>
              <div>
                {isUpdating && <div>updating...</div>}
                {!isUpdating && column && <ColumnEditor column={column} setColumnOption={setColumnOption} />}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function TablesShow() {
  const router = useRouter()
  const dataSourceId = router.query.dataSourceId as string
  const tableName = router.query.tableName as string
  const { data, error, isLoading } = useGetColumnsQuery({
    dataSourceId,
    tableName,
  }, { skip: !dataSourceId || !tableName })

  return (
    <Layout>
      {isLoading && <div>loading...</div>}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && data?.ok && (
        <FieldsEditor
          tableName={tableName}
          columns={data?.data}
          dataSourceId={dataSourceId}
        />
      )}
    </Layout>
  )
}

export default TablesShow
