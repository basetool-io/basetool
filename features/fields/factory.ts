import { ElementType } from "react";
import { Views } from "./enums";
import BooleanEditField from "@/plugins/fields/Boolean/Edit";
import BooleanIndexField from "@/plugins/fields/Boolean/Index";
import BooleanShowField from "@/plugins/fields/Boolean/Show";
import DateTimeEditField from "@/plugins/fields/DateTime/Edit";
import DateTimeIndexField from "@/plugins/fields/DateTime/Index";
import DateTimeShowField from "@/plugins/fields/DateTime/Show";
import IdEditField from "@/plugins/fields/Id/Edit";
import IdIndexField from "@/plugins/fields/Id/Index";
import IdShowField from "@/plugins/fields/Id/Show";
import NumberEditField from "@/plugins/fields/Number/Edit";
import NumberIndexField from "@/plugins/fields/Number/Index";
import NumberShowField from "@/plugins/fields/Number/Show";
import TextEditField from "@/plugins/fields/Text/Edit";
import TextIndexField from "@/plugins/fields/Text/Index";
import TextShowField from "@/plugins/fields/Text/Show";
import TextareaEditField from "@/plugins/fields/Textarea/Edit";
import TextareaIndexField from "@/plugins/fields/Textarea/Index";
import TextareaShowField from "@/plugins/fields/Textarea/Show";
import type { Column } from "./types";

// export const getFieldForEdit = (column: Column) => {
//   // switch (column.fieldType) {
//   //   default:
//   //   case 'Text':
//   //     return TextEditField
//   //   case 'Number':
//   //     return NumberEditField
//   //   case 'Id':
//   //     return IdEditField
//   //   case 'Boolean':
//   //     return BooleanEditField
//   //   case 'DateTime':
//   //     return DateTimeEditField
//   // }
// };

// export const getFieldForShow = (column: Column) => {
//   // switch (column.fieldType) {
//   //   default:
//   //   case 'Text':
//   //     return TextShowField
//   //   case 'Number':
//   //     return NumberShowField
//   //   case 'Id':
//   //     return IdShowField
//   //   case 'Boolean':
//   //     return BooleanShowField
//   //   case 'DateTime':
//   //     return DateTimeShowField
//   // }
// };

// export const getFieldForIndex = async (column: Column) => {
//   try {
//     return (await import(`@/plugins/fields/${column.fieldType}/Index`)).default;
//   } catch (error) {}
// };

export const getFieldForEdit = (column: Column) => {
  switch (column.fieldType) {
    default:
    case "Text":
      return TextEditField;
    case "Number":
      return NumberEditField;
    case "Id":
      return IdEditField;
    case "Boolean":
      return BooleanEditField;
    case "DateTime":
      return DateTimeEditField;
    case "Textarea":
      return TextareaEditField;
  }
};

export const getFieldForShow = (column: Column) => {
  switch (column.fieldType) {
    default:
    case "Text":
      return TextShowField;
    case "Number":
      return NumberShowField;
    case "Id":
      return IdShowField;
    case "Boolean":
      return BooleanShowField;
    case "DateTime":
      return DateTimeShowField;
    case "Textarea":
      return TextareaShowField;
  }
};

export const getFieldForIndex = (column: Column) => {
  switch (column.fieldType) {
    default:
    case "Id":
      return IdIndexField;
    case "Text":
      return TextIndexField;
    case "Number":
      return NumberIndexField;
    case "Boolean":
      return BooleanIndexField;
    case "DateTime":
      return DateTimeIndexField;
    case "Textarea":
      return TextareaIndexField;
  }
};

export const getField = (column: Column, view: Views): ElementType => {
  switch (view) {
    case Views.new:
    case Views.edit:
      return getFieldForEdit(column);
    default:
    case Views.show:
      return getFieldForShow(column);
    case Views.index:
      return getFieldForIndex(column);
  }
};
