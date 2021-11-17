import { Column } from "react-table";
import { DataSource } from "@prisma/client";
import { hydrateColumns } from "../records";
import getQueryService from "@/plugins/data-sources/getQueryService";

export const getColumns = async ({
  dataSource,
  tableName,
  storedColumns = [],
}: {
  dataSource: DataSource;
  tableName: string;
  storedColumns: [];
}): Promise<Column[]> => {
  const service = await getQueryService({
    dataSource,
    options: { cache: false },
  });

  let columns = await service.runQuery("getColumns", {
    tableName: tableName,
    storedColumns,
  });

  columns = hydrateColumns(columns, storedColumns);

  return columns;
};
