import { Button, ButtonGroup, Checkbox } from "@chakra-ui/react";
import { CheckIcon, DotsHorizontalIcon, EyeIcon, PencilAltIcon, TrashIcon } from "@heroicons/react/outline";
import { Row } from "react-table";
import { iconForField } from "@/features/fields";
import { isUndefined } from "lodash";
import { useDeleteRecordMutation, usePrefetch } from "@/features/records/api-slice";
import { useRouter } from "next/router";
import { useSelectRecords, useSidebarsVisible } from "@/hooks";
import Link from "next/link"
import React, { memo, useMemo } from "react";
import classNames from "classnames";

const IndexFieldWrapper = ({ cell }: { cell: any }) => {
  const column = useMemo(() => cell.column?.meta, [cell]);
  const IconElement = useMemo(
    () => iconForField(column),
    [column.fieldType]
  );

  return (
    <div className="td px-6 py-2 whitespace-nowrap text-sm text-gray-500 truncate">
      <div className="flex items-center space-x-2 md:min-h-16 md:py-4">
        <IconElement className="h-4 inline-block flex-shrink-0" />{" "}
        <span>{column.label}</span>
      </div>

      {cell.render("Cell")}
    </div>
  );
};

const MobileRow = ({
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

  const hasId = !isUndefined(row?.original?.id);
  const link = `/data-sources/${dataSourceId}/tables/${tableName}/${row.original.id}`;

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
      // {...row.getRowProps()}
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
      className={classNames("flex flex-col w-full hover:bg-gray-100 border-b", {
        "bg-white": index % 2 === 0,
        "bg-gray-50": index % 2 !== 0,
        "cursor-pointer": hasId,
      })}
      onClick={() => setSidebarVisible(false)}
    >
      <div className="td px-6 py-2 whitespace-nowrap text-sm text-gray-500 truncate">
        <div className="flex items-center space-x-2 md:min-h-16 md:py-4">
          <CheckIcon className="h-4 inline-block flex-shrink-0" />{" "}
          <span>Select</span>
        </div>
        <Checkbox colorScheme="gray" isChecked={selectedRecords.includes(row?.original?.id)} onChange={(e) => toggleRecordSelection(row?.original?.id)} />
      </div>

      {row.cells.map((cell) => (
        <IndexFieldWrapper cell={cell} />
      ))}

      <div className="td px-6 py-2 whitespace-nowrap text-sm text-gray-500 truncate">
        <div className="flex items-center space-x-2 md:min-h-16 md:py-4">
          <DotsHorizontalIcon className="h-4 inline-block flex-shrink-0" />{" "}
          <span>Controls</span>
        </div>
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

export default memo(MobileRow)
