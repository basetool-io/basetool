import { TableShowComponent } from "../tables/[tableName]";
import { View } from "@/plugins/views/types";
import { useFilters } from "@/hooks";
import { useGetViewQuery } from "@/features/views/api-slice";
import { useRouter } from "next/router";
import React, { memo, useEffect, useState } from "react";

function ViewTableShow() {
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

  const [view, setView] = useState<View>();
  const { filters, setFilters, applyFilters, resetFilters } = useFilters();

  useEffect(() => {
    if(viewResponse?.ok) {
      setView(viewResponse.data);
      if (viewResponse.data.filters.length > 0) {
        resetFilters();
        setFilters(viewResponse.data.filters);
        applyFilters(viewResponse.data.filters);
      }
    }
  }, [viewResponse]);

  return (
    <TableShowComponent view={view}/>
  );
}

export default memo(ViewTableShow);
