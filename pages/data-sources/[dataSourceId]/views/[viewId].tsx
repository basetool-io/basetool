



import { TableShowComponent } from "../tables/[tableName]";
import { useGetViewQuery } from "@/features/views/api-slice";
import { useRouter } from "next/router";
import React, { memo, useEffect, useState } from "react";

function ViewTablesShow() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const viewId = router.query.viewId as string;

  const { data: viewResponse } = useGetViewQuery(
    {
      dataSourceId,
      viewId,
    },
    {
      skip: !dataSourceId || !viewId,
    }
  );

  const [tableName, setTableName] = useState("");
  useEffect(() => {
    if(viewResponse?.ok) setTableName(viewResponse.data.tableName);
  }, [viewResponse]);

  return (
    <TableShowComponent viewTableName={tableName} />
  );
}

export default memo(ViewTablesShow);
