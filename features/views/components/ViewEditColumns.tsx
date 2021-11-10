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
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useColumnsForView } from "../hooks";
import { useCreateColumnMutation } from "@/features/views/api-slice";
import { useDataSourceContext } from "@/hooks";
import DragIcon from "@/components/DragIcon";
import React, { forwardRef, useRef, useState } from "react";
import Shimmer from "@/components/Shimmer";
import TinyLabel from "@/components/TinyLabel";
import classNames from "classnames";

const ColumnItem = ({ column }: { column: Column }) => {
  const IconElement = iconForField(column);
  const dispatch = useAppDispatch();
  const selectedColumnName = useAppSelector(selectedColumnNameSelector);

  const toggleColumnSelection = () => {
    if (selectedColumnName === column?.name) {
      dispatch(selectColumnName(""));
    } else {
      dispatch(selectColumnName(column.name));
    }
  };

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
          onClick={toggleColumnSelection}
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
      dispatch(selectColumnName(name));
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
        >
          Add virtual column
        </Button>
      </div>
    </form>
  );
};

const ViewEditColumns = () => {
  const { columns, columnsAreLoading } = useColumnsForView();
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
          columns &&
          columns.map((column: Column) => <ColumnItem column={column} />)}
      </div>
    </div>
  );
};

export default ViewEditColumns;
