import { Button, Tooltip } from "@chakra-ui/react";
import { TrashIcon } from "@heroicons/react/outline";
import { isNumber } from "lodash";
import { useDataSourceContext } from "@/hooks";
import { useDeleteBulkRecordsMutation } from "@/features/records/api-slice";
import { useSelectRecords } from "@/features/records/hooks";
import React, { useEffect, useMemo, useState } from "react";
import pluralize from "pluralize";

function BulkDeleteButton() {
  const { selectedRecords } = useSelectRecords();
  const { tableName, dataSourceId } = useDataSourceContext();
  const [deleteBulkRecords, { isLoading: isDeleting }] =
    useDeleteBulkRecordsMutation();

  const [filteredSelectedRecords, setFilteredSelectedRecords] = useState<number[]>([]);

  const handleDeleteMultiple = async () => {
    if (
      confirm(
        `Are you sure you want to remove ${filteredSelectedRecords.length} ${pluralize(
          "record",
          filteredSelectedRecords.length
        )}`
      )
    ) {
      await deleteBulkRecords({
        dataSourceId,
        tableName,
        recordIds: filteredSelectedRecords as number[],
      });
    }
  };

  const deleteMessage = useMemo(
    () =>
      `Delete ${filteredSelectedRecords.length} ${pluralize(
        "record",
        filteredSelectedRecords.length
      )}`,
    [filteredSelectedRecords.length]
  );

  useEffect(() => {
    setFilteredSelectedRecords(selectedRecords.filter((id) => isNumber(id)));
  }, [selectedRecords])

  return (
    <Tooltip label={deleteMessage} placement="bottom" gutter={10}>
      <Button
        className="text-red-600 text-sm cursor-pointer"
        variant="link"
        colorScheme="red"
        leftIcon={<TrashIcon className="h-4" />}
        isLoading={isDeleting}
        isDisabled={filteredSelectedRecords.length === 0}
        onClick={handleDeleteMultiple}
      >
        {filteredSelectedRecords.length > 0 && deleteMessage}
        {/* Add empty space 👇 so the icon doesn't get offset to the left when "Delete records" label is displayed */}
        {filteredSelectedRecords.length === 0 && <>&nbsp;&nbsp;&nbsp;&nbsp;</>}
      </Button>
    </Tooltip>
  );
}

export default BulkDeleteButton;
