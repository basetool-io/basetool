import { RecordsEditComponent } from "@/pages/data-sources/[dataSourceId]/tables/[tableName]/[recordId]/edit";
import { View } from "@/plugins/views/types";
import { useGetViewQuery } from "@/features/views/api-slice";
import { useRouter } from "next/router";
import React, { memo, useEffect, useState } from "react";

function ViewRecordsShow() {
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

  useEffect(() => {
    if(viewResponse?.ok) {
      setView(viewResponse.data);
    }
  }, [viewResponse]);

  return (
    <RecordsEditComponent view={view}/>
  );
}

export default memo(ViewRecordsShow);
