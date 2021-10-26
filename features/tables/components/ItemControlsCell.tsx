import { Row } from "react-table";
import ItemControls from "./ItemControls";
import React, { memo } from "react";

const ItemControlsCell = ({ row }: { row: Row<any> }) => (
  <div className="flex items-center justify-center h-full">
    <ItemControls recordId={row?.original?.id} />
  </div>
);

export default memo(ItemControlsCell);
