import { ElementType } from "react";
import { Views } from "./enums";
import AssociationEditField from "@/plugins/fields/Association/Edit";
import AssociationIndexField from "@/plugins/fields/Association/Index";
import AssociationShowField from "@/plugins/fields/Association/Show";
import BooleanEditField from "@/plugins/fields/Boolean/Edit";
import BooleanIndexField from "@/plugins/fields/Boolean/Index";
import BooleanShowField from "@/plugins/fields/Boolean/Show";
import DateTimeEditField from "@/plugins/fields/DateTime/Edit";
import DateTimeIndexField from "@/plugins/fields/DateTime/Index";
import DateTimeShowField from "@/plugins/fields/DateTime/Show";
import IdEditField from "@/plugins/fields/Id/Edit";
import IdIndexField from "@/plugins/fields/Id/Index";
import IdShowField from "@/plugins/fields/Id/Show";
import JsonEditField from "@/plugins/fields/Json/Edit";
import JsonIndexField from "@/plugins/fields/Json/Index";
import JsonShowField from "@/plugins/fields/Json/Show";
import NumberEditField from "@/plugins/fields/Number/Edit";
import NumberIndexField from "@/plugins/fields/Number/Index";
import NumberShowField from "@/plugins/fields/Number/Show";
import SelectEditField from "@/plugins/fields/Select/Edit";
import SelectIndexField from "@/plugins/fields/Select/Index";
import SelectShowField from "@/plugins/fields/Select/Show";
import TextEditField from "@/plugins/fields/Text/Edit";
import TextIndexField from "@/plugins/fields/Text/Index";
import TextShowField from "@/plugins/fields/Text/Show";
import TextareaEditField from "@/plugins/fields/Textarea/Edit";
import TextareaIndexField from "@/plugins/fields/Textarea/Index";
import TextareaShowField from "@/plugins/fields/Textarea/Show";

import type { Column } from "./types";

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
    case "Select":
      return SelectEditField;
    case "Textarea":
      return TextareaEditField;
    case "Json":
      return JsonEditField;
    case "Association":
      return AssociationEditField;
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
    case "Select":
      return SelectShowField;
    case "Textarea":
      return TextareaShowField;
    case "Json":
      return JsonShowField;
    case "Association":
      return AssociationShowField;
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
    case "Select":
      return SelectIndexField;
    case "Textarea":
      return TextareaIndexField;
    case "Json":
      return JsonIndexField;
    case "Association":
      return AssociationIndexField;
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
