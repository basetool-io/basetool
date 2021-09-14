import '@testing-library/jest-dom';
import { fieldId } from "@/features/fields";
import { joiResolver } from "@hookform/resolvers/joi";
import { render, screen } from '@testing-library/react';
import { useForm } from "react-hook-form";
import Edit from '../plugins/fields/Text/Edit.tsx'
import Index from '../plugins/fields/Text/Index.tsx'
import Joi from "joi";
import React from 'react';
import Show from '../plugins/fields/Text/Show.tsx'

const field = {
  "value": "That was the best ice-cream soda I ever tasted.",
  "column": {
      "name": "name",
      "label": "Name",
      "dataSourceInfo": {
          "type": "character varying",
          "maxLength": null,
          "nullable": true,
          "defaultValue": null
      },
      "primaryKey": false,
      "baseOptions": {
          "visibility": [
              "index",
              "show",
              "edit",
              "new"
          ],
          "required": false,
          "nullable": false,
          "readonly": false,
          "placeholder": "",
          "help": ""
      },
      "fieldType": "Text",
      "fieldOptions": {}
  },
  "record": {
      "id": "6",
      "name": "That was the best ice-cream soda I ever tasted.",
      "body": "Mollitia ea quod. Expedita qui est. Et eligendi fugiat.\nQuasi est quia. Natus nobis excepturi. Explicabo sed minus.\nNeque consectetur in. Harum explicabo facere. Sunt aut voluptatem.\nTotam voluptatem et. Corporis id error. Molestias qui quia.\nEt modi voluptas. Itaque accusamus ducimus. Debitis id ut.\nSequi enim commodi. Et eligendi quo. Recusandae fugiat ab.",
      "is_featured": false,
      "published_at": "2020-09-06T12:03:24.300Z",
      "user_id": null,
      "created_at": "2021-03-31T12:03:24.300Z",
      "updated_at": "2021-06-30T10:24:56.016Z",
      "status": 0
  },
  "tableName": "posts"
};

const schema = Joi.string().allow("");

const record = {
  "id": "6",
  "name": "That was the best ice-cream soda I ever tasted.",
  "body": "Mollitia ea quod. Expedita qui est. Et eligendi fugiat.\nQuasi est quia. Natus nobis excepturi. Explicabo sed minus.\nNeque consectetur in. Harum explicabo facere. Sunt aut voluptatem.\nTotam voluptatem et. Corporis id error. Molestias qui quia.\nEt modi voluptas. Itaque accusamus ducimus. Debitis id ut.\nSequi enim commodi. Et eligendi quo. Recusandae fugiat ab.",
  "is_featured": false,
  "published_at": "2020-09-06T12:03:24.300Z",
  "user_id": null,
  "created_at": "2021-03-31T12:03:24.300Z",
  "updated_at": "2021-06-30T10:24:56.016Z",
  "status": 0
}

const TestWrapperForm = ({ Component, field, defaultValues, schema }) => {
  const { register, handleSubmit, formState, setValue, getValues, watch } =
  useForm({
    defaultValues,
    resolver: joiResolver(schema),
  });

  return (
    <Component field={field} formState={formState} register={register} schema={schema} setValue={setValue} />
  )
}

describe('TextField', () => {

  test('renders Show component', () => {
    render(<Show field={field}/>);

    const label = screen.getByText(field.column.label)
    const value = screen.getByText(field.value)

    expect(label).toBeInTheDocument()
    expect(value).toBeInTheDocument()
  });

  test('renders Index component', () => {
    render(<Index field={field}/>);

    const value = screen.getByText(field.value)

    expect(value).toBeInTheDocument()
  });

  test('renders Edit component', () => {
    const result = render(<TestWrapperForm field={field} schema={schema} Component={Edit} defaultValues={record}></TestWrapperForm>);

    const inputElement = result.container.querySelector(`#${fieldId(field)}`);

    expect(inputElement.value).toEqual(field.value)
  });
});

// investigate why it takes so long to run
// daca scrie cnv ceva -> sa se vada in formState
// testam erori de validare
// placeholder, options
// null?
