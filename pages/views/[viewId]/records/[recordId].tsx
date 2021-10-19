import { RecordsShowComponent } from "../../../data-sources/[dataSourceId]/tables/[tableName]/[recordId]";
import React, { memo } from "react";

function ViewRecordsShow() {
  return (
    <RecordsShowComponent />
  );
}

export default memo(ViewRecordsShow);
