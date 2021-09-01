import { Column } from '@/features/fields/types'
import { FormControl, FormLabel, Input } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import fieldOptions from './fieldOptions'

function Inspector({column, setColumnOption}: {
  column: Column;
  setColumnOption: (c: Column, name: string, value: any) => void;
}) {

  const rows = column.fieldOptions.rows ? column.fieldOptions.rows : fieldOptions.rows

  // when changing the field type to this one, the new options are not automatically passed to the column
  useEffect(() => {
    setColumnOption(
      column,
      "fieldOptions.rows",
      rows
    )
  },[])

  return (
    <FormControl id="rows">
      <FormLabel>Rows</FormLabel>
      <Input
        type="number"
        name="rows"
        placeholder="Rows"
        required={false}
        defaultValue={rows as number}
        onChange={(e) =>
          setColumnOption(
            column,
            "fieldOptions.rows",
            parseInt(e.currentTarget.value)
          )
        }
      />
    </FormControl>
  )
}

export default Inspector
