import { Column } from "@/features/fields/types";
import { DataSource } from "@prisma/client";
import { ListTable } from "@/plugins/data-sources/abstract-sql-query-service/types";
import { runQuery } from "@/plugins/data-sources/serverHelpers";
import prisma from "@/prisma";

export type TableMetaData = {
  name: string;
  idColumn: string;
  nameColumn: string;
  createdAtColumn?: string;
  updatedAtColumn?: string;
};

export const doInitialScan = async (dataSource: DataSource) => {
  const tables = (await runQuery(dataSource, "getTables")) as ListTable[];
  const tablesMetaData: TableMetaData[] = [];

  for(const table of tables) {
    const columns = await runQuery(dataSource, "getColumns", {
      tableName: table.name,
      storedColumns: [],
    });
    let idColumn, nameColumn, createdAtColumn, updatedAtColumn;
    columns.forEach((column: Column) => {
      if (column.primaryKey) {
        idColumn = column.name;
      } else {
        switch (column.name.toLowerCase()) {
          case "id":
          case "uuid":
            idColumn = column.name;
          case "name":
          case "title":
          case "header":
            nameColumn = column.name;
          case "created":
          case "createdat":
          case "created_at":
            createdAtColumn = column.name;
          case "updated":
          case "updatedat":
          case "updated_at":
            updatedAtColumn = column.name;
        }
      }
    });
    tablesMetaData.push({
      name: table.name,
      idColumn: idColumn ? idColumn : columns[0].name,
      nameColumn: nameColumn ? nameColumn : columns[0].name,
      createdAtColumn,
      updatedAtColumn,
    });
  }

  await prisma.dataSource.update({
    where: {
      id: dataSource.id,
    },
    data: {
      tablesMetaData,
    },
  });
};
