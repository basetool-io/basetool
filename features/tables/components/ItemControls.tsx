import { EyeIcon, PencilAltIcon, TrashIcon } from "@heroicons/react/outline";
import { Tooltip } from "@chakra-ui/react";
import { useAccessControl, useAppRouter, useResponsive } from "@/hooks";
import { useDeleteRecordMutation } from "@/features/records/api-slice";
import Link from "next/link";
import React, { memo } from "react";

function ItemControls({ recordId }: { recordId: string }) {
  const { isMd } = useResponsive();

  const {dataSourceId, tableName, recordHref} = useAppRouter();

  const [deleteRecord] = useDeleteRecordMutation();
  const ac = useAccessControl();

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to remove this record?");
    if (confirmed) {
      await deleteRecord({
        dataSourceId: dataSourceId,
        tableName: tableName,
        recordId: recordId,
      }).unwrap();
    }
  };

  return (
    <div className="flex space-x-2 items-center h-full">
      {ac.readAny("record").granted && (
        <Link href={`${recordHref}/${recordId}`}>
          <a>
            <Tooltip label="View record">
              <div>
                <EyeIcon className={isMd ? "h-5" : "h-6"} />
              </div>
            </Tooltip>
          </a>
        </Link>
      )}
      {ac.updateAny("record").granted && (
        <Link href={`${recordHref}/${recordId}/edit`}>
          <a>
            <Tooltip label="Edit record">
              <div>
                <PencilAltIcon className={isMd ? "h-5" : "h-6"} />
              </div>
            </Tooltip>
          </a>
        </Link>
      )}
      {ac.deleteAny("record").granted && (
        <a onClick={handleDelete} className="cursor-pointer">
          <Tooltip label="Delete record">
            <div>
              <TrashIcon className={isMd ? "h-5" : "h-6"} />
            </div>
          </Tooltip>
        </a>
      )}
    </div>
  );
}

export default memo(ItemControls);
