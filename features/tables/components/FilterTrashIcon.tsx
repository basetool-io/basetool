import { Button, Tooltip } from "@chakra-ui/react";
import { TrashIcon } from "@heroicons/react/outline";
import React, { memo } from "react";

const FilterTrashIcon = ({ onClick }: { onClick: () => void }) => (
  <div className="w-5">
    <Tooltip label="Remove">
      <Button size="xs" variant="link" onClick={onClick}>
        <TrashIcon className="h-3 text-gray-700" />
      </Button>
    </Tooltip>
  </div>
);

export default memo(FilterTrashIcon);
