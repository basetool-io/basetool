import { EyeIcon, PencilAltIcon, TrashIcon } from "@heroicons/react/outline";
import { Tooltip } from "@chakra-ui/react";
import { isUndefined } from "lodash";
import { useAccessControl, useResponsive } from "@/hooks";
import { useDeleteRecordMutation } from "@/features/records/api-slice";
import { useGetViewQuery } from "@/features/views/api-slice";
import { useRouter } from "next/router";
import Link from "next/link";
import React, { memo, useEffect, useState } from "react";

function ItemControls({ recordId }: { recordId: string }) {
  const router = useRouter();
  const { isMd } = useResponsive();

  let showHref = "";
  if (!isUndefined(router.query.tableName)) {
    showHref = `/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/${recordId}`;
  } else if (!isUndefined(router.query.viewId)) {
    showHref = `/data-sources/${router.query.dataSourceId}/views/${router.query.viewId}/records/${recordId}`;
  }

  const [tableName, setTableName] = useState("");

  if (router.query.tableName && tableName !== router.query.tableName) {
    setTableName(router.query.tableName as string);
  }

  const dataSourceId = router.query.dataSourceId as string;
  const viewId = router.query.viewId as string;

  const { data: viewResponse } = useGetViewQuery(
    {
      dataSourceId,
      viewId,
    },
    {
      skip: !dataSourceId || !viewId,
    }
  );

  useEffect(() => {
    if (viewResponse?.ok) {
      setTableName(viewResponse.data.tableName);
    }
  }, [viewResponse]);

  const [deleteRecord] = useDeleteRecordMutation();
  const ac = useAccessControl();

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to remove this record?");
    if (confirmed) {
      await deleteRecord({
        dataSourceId: router.query.dataSourceId as string,
        tableName: tableName,
        recordId: recordId,
      }).unwrap();
    }
  };

  return (
    <div className="flex space-x-2 items-center h-full">
      {ac.readAny("record").granted && (
        <Link href={showHref}>
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
        <Link href={`${showHref}/edit`}>
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
