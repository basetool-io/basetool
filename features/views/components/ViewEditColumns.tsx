import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import { EyeOffIcon, PlusCircleIcon, PlusIcon } from "@heroicons/react/outline";
import { INITIAL_NEW_COLUMN } from "@/features/data-sources";
import { ItemTypes } from "@/lib/ItemTypes";
import { MINIMUM_VIEW_NAME_LENGTH } from "@/lib/constants";
import {
  activeColumnNameSelector,
  columnsSelector,
  setActiveColumnName,
} from "@/features/records/state-slice";
import { iconForField } from "@/features/fields";
import { isArray, isEqual, snakeCase, sortBy } from "lodash";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useColumnsForView } from "../hooks";
import {
  useCreateColumnMutation,
  useReorderColumnsMutation,
} from "@/features/views/api-slice";
import { useDataSourceContext } from "@/hooks";
import { useDrag, useDrop } from "react-dnd";
import DragIcon from "@/components/DragIcon";
import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import Shimmer from "@/components/Shimmer";
import TinyLabel from "@/components/TinyLabel";
import classNames from "classnames";
import update from "immutability-helper";

const ColumnItem = ({
  column,
  moveColumn,
}: {
  column: Column;
  moveColumn: any;
}) => {
  const IconElement = iconForField(column);
  const dispatch = useAppDispatch();
  const activeColumnName = useAppSelector(activeColumnNameSelector);

  const toggleColumnSelection = () => {
    if (activeColumnName === column?.name) {
      dispatch(setActiveColumnName(""));
    } else {
      dispatch(setActiveColumnName(column.name));
    }
  };

  const id = column.name;
  const [{ item, isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.COLUMN,
      item: { id },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        item: monitor.getItem(),
      }),
    }),
    [moveColumn, id]
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.COLUMN,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
      canDrop: () => false,
      hover(item: { id: string }) {
        const draggedColumnName = item.id;
        const overColumnName = column.name;
        if (draggedColumnName !== overColumnName && moveColumn) {
          moveColumn(draggedColumnName, overColumnName);
        }
      },
    }),
    [moveColumn, id]
  );

  const hidden = useMemo(() => column.baseOptions.disconnected, [column]);

  return (
    <div
      className={classNames(
        "relative flex items-center justify-between cursor-pointer group rounded",
        {
          "bg-blue-600 text-white": activeColumnName === column.name,
          "hover:bg-gray-100":
            activeColumnName !== column.name ||
            (!isDragging && item?.id === column?.name),
          "!bg-gray-800 opacity-25":
            isOver || (isDragging && item?.id === column?.name),
        }
      )}
      ref={preview}
    >
      <div className="flex items-center flex-1 hover:cursor-pointer">
        <span ref={(node: any) => drag(drop(node))} className="h-full ml-1">
          <DragIcon />{" "}
        </span>
        <div
          className="flex-1 flex items-center justify-between"
          onClick={toggleColumnSelection}
        >
          <span className="flex items-center">
            <IconElement className="h-4 self-start mt-1 ml-1 mr-2 lg:self-center lg:mt-0 inline-block flex-shrink-0" />{" "}
            <span className="text-">{column.name}</span>{" "}
          </span>
          <span className="flex items-center">
            {hidden && <EyeOffIcon className="h-4 mr-1 inline" />}
          </span>
        </div>
      </div>
    </div>
  );
};

const NameInput = forwardRef((props: any, ref: any) => {
  return (
    <FormControl>
      <FormLabel htmlFor="name">Name</FormLabel>
      <Input ref={ref} id="name" size="sm" {...props} />
      <FormHelperText>What should the column be called.</FormHelperText>
    </FormControl>
  );
});
NameInput.displayName = "NameInput";

// 2. Create the form
const Form = ({
  firstFieldRef,
  onClose,
}: {
  firstFieldRef: any;
  onClose: () => void;
}) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [createColumn, { isLoading }] = useCreateColumnMutation();
  const { viewId } = useDataSourceContext();
  const { columns } = useColumnsForView();

  const columnExists = () =>
    columns.some((column: Column) => column.name === snakeCase(name));

  const createField = async () => {
    if (name.length < MINIMUM_VIEW_NAME_LENGTH) return;

    const newColumn = {
      ...INITIAL_NEW_COLUMN,
      name: snakeCase(name),
      label: name,
      baseOptions: {
        ...INITIAL_NEW_COLUMN.baseOptions,
        label: name,
      },
    };

    // close popover
    onClose();

    const response = await createColumn({
      viewId,
      body: newColumn,
    }).unwrap();

    if (response?.ok) {
      // select the newly created column
      dispatch(setActiveColumnName(name));
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        if (columnExists()) {
          toast.error("A column with that name already exists.");

          return;
        }

        // Clear the input value
        setName("");
        firstFieldRef.current.value = "";

        createField();
      }}
    >
      <NameInput
        ref={firstFieldRef}
        onChange={(e: any) => setName(e.currentTarget.value)}
      />
      <div className="mt-2">
        <Button
          type="submit"
          size="sm"
          colorScheme="blue"
          width="100%"
          isDisabled={name.length < MINIMUM_VIEW_NAME_LENGTH}
          isLoading={isLoading}
          leftIcon={<PlusIcon className="text-white h-4" />}
        >
          Add virtual column
        </Button>
      </div>
    </form>
  );
};

const ViewEditColumns = ({
  columnsAreLoading,
}: {
  columnsAreLoading?: boolean;
}) => {
  const dispatch = useAppDispatch();
  const columns = useAppSelector(columnsSelector);
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { viewId } = useDataSourceContext();
  const firstFieldRef = useRef(null);

  const [order, setOrder] = useState<string[]>([]);

  useEffect(() => {
    if (isArray(columns)) {
      const newOrder = sortBy(columns, [(c) => c?.baseOptions?.orderIndex]).map(
        ({ name }: Column) => name
      );
      setOrder(newOrder);
    }
  }, [columns]);

  // Order the columns in an array
  const orderedColumns = useMemo(
    () => sortBy(columns, [(column: Column) => order.indexOf(column.name)]),
    [columns, order]
  );

  const [{ didDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.COLUMN,
    collect: (monitor) => ({
      didDrop:
        monitor.getItemType() === ItemTypes.COLUMN ? monitor.didDrop() : false,
    }),
  }));

  const [reorderColumns] = useReorderColumnsMutation();

  const moveColumn = (from: string, to: string) => {
    const fromIndex = order.indexOf(from);
    const toIndex = order.indexOf(to);

    const newOrder = update(order, {
      $splice: [
        [fromIndex, 1],
        [toIndex, 0, from],
      ],
    }).filter(Boolean);

    if (!isEqual(order, newOrder)) {
      setOrder(newOrder);
    }
  };

  // We have to save the order of the columns when the order changes, and the order changes when an element is dropped.
  useEffect(() => {
    if (didDrop === true) {
      reorderColumns({
        viewId: viewId,
        body: { order },
      }).unwrap();
    }
  }, [didDrop]);

  useEffect(() => {
    return () => {
      dispatch(setActiveColumnName(""));
    }
  }, [])

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <TinyLabel>Columns</TinyLabel>{" "}
          <span className="text-xs text-gray-600">(click to edit)</span>
        </div>
        <div className="flex items-center">
          <Popover
            isOpen={isOpen}
            initialFocusRef={firstFieldRef}
            onOpen={onOpen}
            onClose={onClose}
          >
            <PopoverTrigger>
              <div className="flex justify-center items-center h-full mx-1 text-xs cursor-pointer">
                <PlusCircleIcon className="h-4 inline mr-px" /> Add
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverBody>
                <Form firstFieldRef={firstFieldRef} onClose={onClose} />
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="mt-2" ref={drop}>
        {columnsAreLoading && (
          <div className="space-y-1">
            <Shimmer height="15px" width="60px" />
            <Shimmer height="15px" width="160px" />
            <Shimmer height="15px" width="120px" />
            <Shimmer height="15px" width="80px" />
            <Shimmer height="15px" width="140px" />
            <Shimmer height="15px" width="210px" />
            <Shimmer height="15px" width="90px" />
            <Shimmer height="15px" width="110px" />
          </div>
        )}
        {!columnsAreLoading &&
          orderedColumns &&
          orderedColumns.map((column: Column, idx: number) => (
            <ColumnItem key={idx} column={column} moveColumn={moveColumn} />
          ))}
      </div>
    </div>
  );
};

export default ViewEditColumns;
