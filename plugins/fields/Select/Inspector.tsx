import { Column } from '@/features/fields/types'
import { FormControl, FormHelperText, FormLabel, Input } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import fieldOptions from './fieldOptions'

function Inspector({column, setColumnOption}: {
  column: Column;
  setColumnOption: (c: Column, name: string, value: any) => void;
}) {

  const defaultOptions = fieldOptions.options ? fieldOptions.options : ''
  const initialOptions = column.fieldOptions.options ? column.fieldOptions.options : defaultOptions

  // when changing the field type to this one, the new options are not automatically passed to the column
  useEffect(() => {
    setColumnOption(
      column,
      "fieldOptions.options",
      initialOptions
    )
  },[])

  return (
    <FormControl id="options">
      <FormLabel>Options</FormLabel>
      <Input
        type="text"
        name="options"
        placeholder="Options"
        required={false}
        defaultValue={initialOptions as string}
        onChange={(e) => {
          setColumnOption(column, "fieldOptions.options", e.currentTarget.value)
        }}
      />
      <FormHelperText>Add the values comma separated.</FormHelperText>
    </FormControl>
  )
}

export default Inspector
