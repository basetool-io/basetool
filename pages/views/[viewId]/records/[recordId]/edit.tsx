import { RecordsEditComponent } from "@/pages/data-sources/[dataSourceId]/tables/[tableName]/[recordId]/edit";
import React, { memo } from "react";

function ViewRecordsShow() {
  return (
    <RecordsEditComponent />
  );
}

export default memo(ViewRecordsShow);
