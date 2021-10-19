import { TableShowComponent } from "../data-sources/[dataSourceId]/tables/[tableName]";
import React, { memo } from "react";

function ViewTableShow() {

  return (
    <TableShowComponent/>
  );
}

export default memo(ViewTableShow);
