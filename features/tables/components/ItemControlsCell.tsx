import { Row } from "react-table";
import { isUndefined } from "lodash";
import ItemControls from "./ItemControls";
import React, { memo } from "react";

const ItemControlsCell = ({ row }: { row: Row<any> }) => {
  if (isUndefined(row?.original?.id)) return null;

  return <div className="flex items-center justify-center h-full">
    <ItemControls recordId={row?.original?.id} />
  </div>
};

export default memo(ItemControlsCell);
