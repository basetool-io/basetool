import { Column } from '@/features/fields/types'
import { FormControl, FormLabel, Input } from '@chakra-ui/react'
import { isString, isUndefined } from 'lodash';
import React, { useEffect, useState } from 'react'
import { WithContext as ReactTags } from "react-tag-input";

function Inspector({column, setColumnOption}: {
  column: Column;
  setColumnOption: (c: Column, name: string, value: any) => void;
}) {

  // todo get default options and set defaults
  const initialOptions = isString(column.fieldOptions.options) ? JSON.parse(column.fieldOptions.options) : []

  // const initialOptions = useMemo(
  //   () => (isString(column.options) ? JSON.parse(column.options) : []),
  //   [column.options]
  // );

  const [tags, setTags] = useState();

  const handleDelete = (i) => {
    setTags(tags.filter((tag, index) => index !== i));
  };

  const handleAddition = (tag) => {
    setTags([...tags, tag]);
  };

  const handleDrag = (tag, currPos, newPos) => {
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    setTags(newTags);
  };

  useEffect(() => {
    // Update the column options on tags update
    if (!isUndefined(tags)) {
      setColumnOption(column, "fieldOptions.options", JSON.stringify(tags));
    }
  }, [tags]);

  useEffect(() => {
    setTags(initialOptions)
  }, [initialOptions]);

  return (
    <>
      <FormControl id="tags">
        <FormLabel>Add options</FormLabel>
        <ReactTags
          tags={tags}
          labelField={"label"}
          handleDelete={handleDelete}
          handleAddition={handleAddition}
          handleDrag={handleDrag}
        />
      </FormControl>
      <FormControl id="options">
        <FormLabel>Modify options</FormLabel>
        <Input
          type="text"
          name="rows"
          placeholder="Options"
          required={false}
          value={initialOptions}
          onChange={(e) => {
            setColumnOption(column, "fieldOptions.options", e.currentTarget.value)
            setTags(JSON.parse(e.currentTarget.value))
          }}
        />
      </FormControl>
    </>
  )
}

export default Inspector
