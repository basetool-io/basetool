import {
  AnnotationIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  HashtagIcon,
  KeyIcon,
  LinkIcon,
  PhotographIcon,
  SelectorIcon,
  TrendingUpIcon,
} from "@heroicons/react/outline";
import { BasetoolRecord } from "../records/types"
import { ElementType } from "react";
import { compact, first, isPlainObject } from "lodash";
import BracketsCurlyIcon from "@/components/svg/BracketsCurlyIcon";
import QuestionIcon from "@/components/svg/QuestionIcon";
import TextIcon from "@/components/svg/TextIcon";
import isArray from "lodash/isArray";
import type { Column, Field, FieldType, FieldValue } from "./types";

export const idColumns = ["id", "_id", "ID", "Id"];

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
      id: "Textarea",
      label: "Text area",
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
      id: "Json",
      label: "JSON",
    },
    {
      id: "ProgressBar",
      label: "Progress Bar",
    },
    {
      id: "Gravatar",
      label: "Gravatar",
    },
  ];

  if (column.foreignKeyInfo) {
    options.push({
      id: "Association",
      label: "Association",
    });
  }

  if (column.baseOptions.computed) {
    options.push({
      id: "LinkTo",
      label: "LinkTo",
    });
  }

  return options;
};

export const stringifyData = (rawData: any[]): any[] =>
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

export const fieldId = (field: Field) =>
  `${field.tableName}-${field.column.name}`;

export const makeField = ({
  record,
  column,
  tableName,
}: {
  record: BasetoolRecord;
  column: Column;
  tableName: string;
}): Field => {
  const value = record[column.name] as FieldValue;

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
    case "Json":
      return BracketsCurlyIcon;
    case "Association":
      return ArrowRightIcon;
    case "ProgressBar":
      return TrendingUpIcon;
    case "LinkTo":
      return LinkIcon;
    case "Gravatar":
      return PhotographIcon;
  }
};

export const getBaseOptions = () => ({
  visibleOnIndex: true,
  visibleOnShow: true,
  visibleOnEdit: true,
  visibleOnNew: true,
  required: false,
  nullable: false,
  nullValues: [],
  readonly: false,
  placeholder: "",
  help: "",
  label: "",
  disconnected: false,
  defaultValue: "",
  computed: false,
  computedSource: "",
  backgroundColor: "",
});

export const getColumnNameLabel = (...args: any[]) => {
  return first(compact(args));
};

/* Returns the filtered columns based on their disconnected setting. */
export const getConnectedColumns = (
  columns: Column[],
): Column[] => {
  if (isArray(columns)) {
    return (
      columns
        .filter((column: Column) => !column?.baseOptions.disconnected)
    );
  } else {
    return [];
  }
};

/* Returns the filtered columns based on their visibility settings. */
export const getVisibleColumns = (
  columns: Column[],
  view?: string
): Column[] => {
  if (isArray(columns)) {
    return (
      columns
        .filter((column: Column) => {
          switch (view) {
            case "index":
              return column.baseOptions.visibleOnIndex;
            case "show":
              return column.baseOptions.visibleOnShow;
            case "edit":
              return column.baseOptions.visibleOnEdit;
            case "new":
              return column.baseOptions.visibleOnNew;
            default:
              return true;
          }
        })
    );
  } else {
    return [];
  }
};
