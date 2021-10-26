import { Column } from "@/features/fields/types";
import { Row } from "react-table";
import { Views } from "@/features/fields/enums";
import { getField } from "@/features/fields/factory";
import { makeField } from "@/features/fields";

import React, { memo } from "react";

const Cell = memo(
  ({
    row,
    column,
    tableName,
  }: {
    row: Row;
    column: { meta: Column };
    tableName: string;
  }) => {
    const field = makeField({
      record: row.original,
      column: column?.meta,
      tableName,
    });
    const Element = getField(column.meta, Views.index);

    return <Element field={field} />;
  }
);

export default memo(Cell);
