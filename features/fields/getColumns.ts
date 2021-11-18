import { Column } from "react-table";
import { DataSource } from "@prisma/client";
import { hydrateColumns } from "../records";
import { runQuery } from "@/plugins/data-sources/serverHelpers";

export const getColumns = async ({
  dataSource,
  tableName,
  storedColumns = [],
}: {
  dataSource: DataSource;
  tableName: string;
  storedColumns: [];
}): Promise<Column[]> => {
  let columns = await runQuery(dataSource, "getColumns", {
    tableName: tableName,
    storedColumns,
  });

  columns = hydrateColumns(columns, storedColumns);

  return columns;
};
