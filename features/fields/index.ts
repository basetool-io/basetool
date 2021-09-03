import {
  AnnotationIcon,
  CalendarIcon,
  CheckCircleIcon,
  HashtagIcon,
  KeyIcon,
  SelectorIcon,
} from "@heroicons/react/outline";
import { ElementType } from "react";
import { Views } from "./enums"
import AlignLeftIcon from "@/components/svg/AlignLeftIcon";
import QuestionIcon from "@/components/svg/QuestionIcon";
import TextIcon from "@/components/svg/TextIcon";
import isPlainObject from "lodash/isPlainObject";
import type { Column, Field, FieldType, FieldValue } from "./types";
import type { Record } from '@/features/records/types'

export const idColumns = ["id", "_id"];

export const getColumnOptions = (
  column: Column
): { id: FieldType; label: string }[] => {
  if (idColumns.includes(column.name)) {
    return [{ id: "Id", label: "ID" }];
  }

  const options: { id: FieldType; label: string }[] = [
    {
      id: "Text",
      label: "Text",
    },
    {
      id: "Number",
      label: "Number",
    },
    {
      id: "Boolean",
      label: "Boolean",
    },
    {
      id: "DateTime",
      label: "Date time",
    },
    {
      id: "Select",
      label: "Select",
    },
    {
      id: "Textarea",
      label: "Text area",
    },
  ];

  return options;
};

export const fieldId = (field: Field) =>
  `${field.tableName}-${field.column.name}`;

export const makeField = ({
  record,
  column,
  tableName,
}: {
  record: Record;
  column: Column;
  tableName: string;
}): Field => {
  let value = record[column.name] as FieldValue;

  if (isPlainObject(value)) {
    value = JSON.stringify(value);
  }

  return {
    value,
    column,
    record,
    tableName,
  };
};

export const iconForField = (field: Column): ElementType => {
  if (field.primaryKey) return KeyIcon;

  switch (field.fieldType) {
    default:
      return QuestionIcon;
    case "Text":
      return TextIcon;
    case "Number":
      return HashtagIcon;
    case "Boolean":
      return CheckCircleIcon;
    case "DateTime":
      return CalendarIcon;
    case "Select":
      return SelectorIcon;
    case "Textarea":
      return AnnotationIcon;
  }
};

export const prettifyData = (rawData: any[]): any[] =>
  rawData.map((item: { [key: string]: any }) => {
    const newItem: { [key: string]: string } = {};

    Object.keys(item).forEach((itemKey: string) => {
      const itemValue: string = item[itemKey];
      let finalValue: string;

      if (isPlainObject(itemValue)) {
        finalValue = JSON.stringify(itemValue);
      } else {
        finalValue = itemValue;
      }

      newItem[itemKey] = finalValue;
    });

    return newItem;
  });

export const getBaseOptions = () => ({
  visibility: [Views.index, Views.show, Views.edit, Views.new],
  required: false,
  nullable: false,
  readonly: false,
})
