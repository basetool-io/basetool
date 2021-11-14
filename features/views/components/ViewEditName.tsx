import {
  Editable,
  EditableInput,
  EditablePreview,
  Tooltip,
  useEditableControls,
} from "@chakra-ui/react";
import { PencilAltIcon } from "@heroicons/react/outline";
import { useDataSourceContext } from "@/hooks";
import { useGetViewQuery } from "../api-slice";
import React, { useMemo } from "react";
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

function ViewEditName({
  updateName,
}: {
  updateName: (name: string) => void;
}) {
  const { viewId } = useDataSourceContext();
  const { data: viewResponse, isLoading: viewIsLoading } = useGetViewQuery(
    { viewId },
    { skip: !viewId }
  );

  const view = useMemo(() => viewResponse?.data, [viewResponse]);

  return (
    <div>
      <div className="w-1/2 mr-1">
        <TinyLabel>Name</TinyLabel>
      </div>
      {viewIsLoading && (
        <Shimmer height="18px" width="100px" className="mt-2 mb-1" />
      )}
      {!viewIsLoading && (
        <Editable
          className="flex-1"
          defaultValue={view?.name}
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

export default ViewEditName;
