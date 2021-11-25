import {
  Editable,
  EditableInput,
  EditablePreview,
  Tooltip,
  useEditableControls,
} from "@chakra-ui/react";
import { PencilAltIcon } from "@heroicons/react/outline";
import { isEmpty } from "lodash";
import { useDataSourceContext } from "@/hooks";
import { useDataSourceResponse } from "../hooks";
import { useUpdateDataSourceMutation } from "@/features/data-sources/api-slice";
import React from "react";
import Shimmer from "@/components/Shimmer";
import TinyLabel from "@/components/TinyLabel";

const NameEditButton = () => {
  const { isEditing, getEditButtonProps } = useEditableControls();

  if (isEditing) return null;

  return (
    <Tooltip label="Edit name">
      <div
        className="flex justify-center items-center mx-1 text-xs cursor-pointer"
        {...getEditButtonProps()}
      >
        <PencilAltIcon className="h-4 inline" />
        Edit
      </div>
    </Tooltip>
  );
};

function DataSourceEditName() {
  const { dataSourceId } = useDataSourceContext();

  const { dataSource, isLoading: dataSourceIsLoading } =
    useDataSourceResponse(dataSourceId);

  const [updateDataSource] = useUpdateDataSourceMutation();

  const updateName = async (name: string) => {
    if (!isEmpty(name) && name !== dataSource?.name) {
      await updateDataSource({
        dataSourceId,
        body: {
          name,
        },
      }).unwrap();
    }
  };

  return (
    <div className="my-3">
      <div className="w-1/2 mr-1">
        <TinyLabel>Name</TinyLabel>
      </div>
      {dataSourceIsLoading && (
        <Shimmer height="18px" width="100px" className="mt-2 mb-1" />
      )}
      {!dataSourceIsLoading && (
        <Editable
          className="flex-1"
          defaultValue={dataSource?.name}
          onSubmit={updateName}
          submitOnBlur={true}
        >
          <div className="relative flex justify-between w-full">
            <div className="w-full">
              <EditablePreview className="cursor-pointer" />
              <EditableInput />
            </div>
            <NameEditButton />
          </div>
        </Editable>
      )}
    </div>
  );
}

export default DataSourceEditName;
