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
import { INITIAL_NEW_COLUMN } from "@/features/data-sources";
import { MINIMUM_VIEW_NAME_LENGTH } from "@/lib/constants";
import { PlusCircleIcon } from "@heroicons/react/outline";
import { iconForField } from "@/features/fields";
import { selectColumnName, selectedColumnNameSelector } from "../state-slice";
import { snakeCase } from "lodash";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  useCreateColumnMutation,
  useGetColumnsQuery,
} from "@/features/views/api-slice";
import { useDataSourceContext } from "@/hooks";
import DragIcon from "@/components/DragIcon";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import TinyLabel from "@/components/TinyLabel";
import classNames from "classnames";

const ColumnItem = ({ column }: { column: Column }) => {
  const IconElement = iconForField(column);
  const dispatch = useAppDispatch();
  const selectedColumnName = useAppSelector(selectedColumnNameSelector);

  return (
    <div
      className={classNames(
        "relative flex items-center justify-between cursor-pointer group rounded",
        {
          "bg-blue-600 text-white": selectedColumnName === column.name,
          "hover:bg-gray-100": selectedColumnName !== column.name,
        }
      )}
    >
      <div className="flex items-center flex-1">
        <DragIcon className="" />{" "}
        <div
          className="flex-1 flex items-center"
          onClick={() => dispatch(selectColumnName(column.name))}
        >
          <IconElement className="h-4 self-start mt-1 ml-1 mr-2 lg:self-center lg:mt-0 inline-block flex-shrink-0" />{" "}
          <span className="text-sm">{column.name}</span>
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
      <FormHelperText>What should the name be called.</FormHelperText>
    </FormControl>
  );
});
NameInput.displayName = "NameInput";

// 2. Create the form
const Form = ({ firstFieldRef }: { firstFieldRef: any }) => {
  const [value, setValue] = useState("");
  const [createColumn] = useCreateColumnMutation();
  const { viewId } = useDataSourceContext();

  const createField = async () => {
    if (value.length < MINIMUM_VIEW_NAME_LENGTH) return;

    const newColumn = {
      ...INITIAL_NEW_COLUMN,
      name: snakeCase(value),
      label: value,
      baseOptions: {
        ...INITIAL_NEW_COLUMN.baseOptions,
        label: value,
      },
    };

    await createColumn({
      viewId,
      body: newColumn,
    }).unwrap();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createField();
      }}
    >
      <NameInput
        ref={firstFieldRef}
        onChange={(e: any) => setValue(e.currentTarget.value)}
      />
      <div className="mt-2">
        <Button
          type="submit"
          size="sm"
          colorScheme="blue"
          width="100%"
          isDisabled={value.length < MINIMUM_VIEW_NAME_LENGTH}
        >
          Add virtual column
        </Button>
      </div>
    </form>
  );
};

const ColumnsConfigurator = () => {
  const { viewId } = useDataSourceContext();

  const { data: columnsResponse } = useGetColumnsQuery(
    {
      viewId,
    },
    { skip: !viewId }
  );

  const [columns, setColumns] = useState<Column[]>();
  useEffect(() => {
    setColumns(columnsResponse?.data);
  }, [columnsResponse?.data]);

  const { onOpen, onClose, isOpen } = useDisclosure();
  const firstFieldRef = useRef(null);

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
      <div className="mt-2">
        {columns &&
          columns.map((column: Column) => <ColumnItem column={column} />)}
      </div>
      {/* <pre>{JSON.stringify([columns, view], null, 2)}</pre> */}
    </div>
  );
};

export default ColumnsConfigurator;
