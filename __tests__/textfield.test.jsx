import "@testing-library/jest-dom";
import { fieldId } from "@/features/fields";
import { fireEvent, render, screen } from "@testing-library/react";
import { joiResolver } from "@hookform/resolvers/joi";
import { useForm } from "react-hook-form";
import Edit from "../plugins/fields/Text/Edit.tsx";
import Index from "../plugins/fields/Text/Index.tsx";
import Joi from "joi";
import React from "react";
import Show from "../plugins/fields/Text/Show.tsx";

const value = "That was the best ice-cream soda I ever tasted."

const record = {
  id: "6",
  name: value,
};

const field = {
  value: value,
  column: {
    name: "name",
    label: "Name",
    dataSourceInfo: {
      type: "character varying",
      maxLength: null,
      nullable: true,
      defaultValue: null,
    },
    primaryKey: false,
    baseOptions: {
      visibility: ["index", "show", "edit", "new"],
      required: false,
      nullable: false,
      readonly: false,
      placeholder: "",
      help: "",
    },
    fieldType: "Text",
    fieldOptions: {},
  },
  record,
  tableName: "posts",
};

const schema = Joi.string().allow("");

const TestWrapperForm = ({ Component, field, defaultValues, schema }) => {
  const { register, handleSubmit, formState, setValue, getValues, watch } =
    useForm({
      defaultValues,
      resolver: joiResolver(schema),
    });

  return (
    <Component
      field={field}
      formState={formState}
      register={register}
      schema={schema}
      setValue={setValue}
    />
  );
};

describe("TextField", () => {
  test("renders Show component", () => {
    render(<Show field={field} />);

    const label = screen.getByText(field.column.label);
    const value = screen.getByText(field.value);

    expect(label).toBeInTheDocument();
    expect(value).toBeInTheDocument();
  });

  test("renders Index component", () => {
    render(<Index field={field} />);

    const value = screen.getByText(field.value);

    expect(value).toBeInTheDocument();
  });

  test("renders Edit component", () => {
    const result = render(
      <TestWrapperForm
        Component={Edit}
        field={field}
        schema={schema}
        defaultValues={record}
      />
    );

    const inputElement = result.container.querySelector(`#${fieldId(field)}`);

    expect(inputElement.value).toEqual(field.value);
  });

  test("Edit options", () => {
    field.column.baseOptions.placeholder = "New placeholder"
    field.column.baseOptions.help = "New help"

    const result = render(
      <TestWrapperForm
        Component={Edit}
        field={field}
        schema={schema}
        defaultValues={record}
      />
    );

    const inputElement = result.container.querySelector(`#${fieldId(field)}`);

    expect(inputElement.placeholder).toEqual("New placeholder");

    const help = screen.getByText("New help");

    expect(help).toBeInTheDocument();
  });

  test("changes the input to regular", () => {
    const result = render(
      <TestWrapperForm
        Component={Edit}
        field={field}
        schema={schema}
        defaultValues={record}
      />
    );

    const inputElement = result.container.querySelector(`#${fieldId(field)}`);
    expect(inputElement.value).toEqual(field.value);

    const newInput = 'New input'
    fireEvent.change(inputElement, {target: {value: newInput}})

    expect(inputElement.value).toEqual(newInput);
  });

  test("changes the input to null", () => {
    const result = render(
      <TestWrapperForm
        Component={Edit}
        field={field}
        schema={schema}
        defaultValues={record}
      />
    );

    const inputElement = result.container.querySelector(`#${fieldId(field)}`);
    fireEvent.change(inputElement, {target: {value: null}})
    expect(inputElement.value).toEqual("");
  });

  test("changes the input to empty and required", () => {
    field.column.baseOptions.required = true

    const result = render(
      <TestWrapperForm
        Component={Edit}
        field={field}
        schema={schema}
        defaultValues={record}
      />
    );

    const inputElement = result.container.querySelector(`#${fieldId(field)}`);
    fireEvent.change(inputElement, {target: {value: ""}})
    expect(inputElement.value).toEqual("");

    screen.debug();
  });
});

// TODO
// investigate why it takes so long to run -> may be bcs of macbook, I've imrpoved them a bit
// daca scrie cnv ceva -> sa se vada in formState
// testam erori de validare
// placeholder, options
// null?
