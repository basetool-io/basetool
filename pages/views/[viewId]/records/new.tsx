import { NewComponent } from "@/pages/data-sources/[dataSourceId]/tables/[tableName]/new";
import React, { memo } from "react";

function ViewNew() {

  //New Record
  return (
    <NewComponent/>
  );
}

export default memo(ViewNew);
