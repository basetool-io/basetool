import { Column } from '@/features/fields/types'
import { FormControl, FormLabel, Input } from '@chakra-ui/react'
import React from 'react'

function Inspector({column, setColumnOption}: {
  column: Column;
  setColumnOption: (c: Column, name: string, value: any) => void;
}) {

  // todo get default options and set defaults
  const rows = column.fieldOptions.rows ? column.fieldOptions.rows : 521

  return (
    <FormControl id="rows">
      <FormLabel>Rows</FormLabel>
      <Input
        type="number"
        name="rows"
        placeholder="Rows"
        required={false}
        value={rows as number}
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
