import { Button, Tooltip } from "@chakra-ui/react";
import { TrashIcon } from "@heroicons/react/outline";
import { useDataSourceContext } from "@/hooks";
import { useDeleteBulkRecordsMutation } from "@/features/records/api-slice";
import { useSelectRecords } from "@/features/records/hooks";
import React, { useMemo } from "react";
import pluralize from "pluralize";

function BulkDeleteButton() {
  const { selectedRecords } = useSelectRecords();
  const { tableName, dataSourceId } = useDataSourceContext();
  const [deleteBulkRecords, { isLoading: isDeleting }] =
    useDeleteBulkRecordsMutation();


  const handleDeleteMultiple = async () => {
    if (
      confirm(
        `Are you sure you want to remove ${selectedRecords.length} ${pluralize(
          "record",
          selectedRecords.length
        )}`
      )
    ) {
      await deleteBulkRecords({
        dataSourceId,
        tableName,
        recordIds: selectedRecords as number[],
      });
    }
  };

  const deleteMessage = useMemo(
    () =>
      `Delete ${selectedRecords.length} ${pluralize(
        "record",
        selectedRecords.length
      )}`,
    [selectedRecords.length]
  );

  return (
    <Tooltip label={deleteMessage} placement="bottom" gutter={10}>
      <Button
        className="text-red-600 text-sm cursor-pointer"
        variant="link"
        colorScheme="red"
        leftIcon={<TrashIcon className="h-4" />}
        isLoading={isDeleting}
        isDisabled={selectedRecords.length === 0}
        onClick={handleDeleteMultiple}
      >
        {selectedRecords.length > 0 && deleteMessage}
        {/* Add empty space 👇 so the icon doesn't get offset to the left when "Delete records" label is displayed */}
        {selectedRecords.length === 0 && <>&nbsp;&nbsp;&nbsp;&nbsp;</>}
      </Button>
    </Tooltip>
  );
}

export default BulkDeleteButton;
