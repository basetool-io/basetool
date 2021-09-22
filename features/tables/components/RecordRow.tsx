import { Button, ButtonGroup } from "@chakra-ui/react";
import { Checkbox } from "@chakra-ui/checkbox";
import { EyeIcon, PencilAltIcon, TrashIcon } from "@heroicons/react/outline";
import { Row } from "react-table";
import { useDeleteRecordMutation, usePrefetch } from "@/features/records/api-slice";
import { useRouter } from "next/router";
import { useSelectRecords, useSidebarsVisible } from "@/hooks";
import Link from "next/link";
import React, { memo } from "react";
import classNames from "classnames";

const RecordRow = ({
  row,
  dataSourceId,
  tableName,
  prepareRow,
  index,
}: {
  row: Row<any>;
  dataSourceId: string;
  tableName: string;
  prepareRow: (row: Row) => void;
  index: number;
}) => {
  const [sidebarsVisible, setSidebarVisible] = useSidebarsVisible();
  const prefetchRecord = usePrefetch("getRecord");
  prepareRow(row);

  const {selectedRecords, toggleRecordSelection} = useSelectRecords();
  const router = useRouter();

  const [deleteRecord, { isLoading: isDeleting }] = useDeleteRecordMutation();

  const handleDelete = async () => {
    const confirmed = confirm(
      "Are you sure you want to remove this record?"
    );
    if (confirmed) {
      await deleteRecord({
        dataSourceId: router.query.dataSourceId as string,
        tableName: router.query.tableName as string,
        recordId: row?.original?.id,
      });
    }
  }

  return (
    <a
      {...row.getRowProps()}
      onMouseOver={() => {
        const id = row.original?.id?.toString();

        if (id) {
          prefetchRecord({
            dataSourceId,
            tableName,
            recordId: row.original.id.toString(),
          });
        }
      }}
      className={classNames("tr relative hover:bg-sky-50 border-b last:border-b-0", {
        "bg-white": index % 2 === 0,
        "bg-gray-50": index % 2 !== 0,
      })}
      onClick={() => setSidebarVisible(false)}
    >
      <div className="td px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <Checkbox colorScheme="gray" isChecked={selectedRecords.includes(row?.original?.id)} onChange={(e) => toggleRecordSelection(row?.original?.id)} />
      </div>
      {row.cells.map((cell) => (
        <div
          {...cell.getCellProps()}
          className="td px-6 py-2 whitespace-nowrap text-sm text-gray-500 truncate"
        >
          {cell.render("Cell")}
        </div>
      ))}
      <div className="td px-1 py-3 whitespace-nowrap text-sm text-gray-500">
        <ButtonGroup size="xs" variant="outline" spacing={1}>
          <Link href={`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/${row?.original?.id}`}
            passHref><Button><EyeIcon className="h-3.5"/></Button></Link>
          <Link href={`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/${row?.original?.id}/edit`}
            passHref><Button><PencilAltIcon className="h-3.5"/></Button></Link>
          <Button onClick={handleDelete}><TrashIcon className="h-3.5"/></Button>
        </ButtonGroup>
      </div>
    </a>
  );
};

export default memo(RecordRow);
