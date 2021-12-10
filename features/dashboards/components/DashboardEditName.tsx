import {
  Editable,
  EditableInput,
  EditablePreview,
  Tooltip,
  useEditableControls,
} from "@chakra-ui/react";
import { PencilAltIcon } from "@heroicons/react/outline";
import { useDashboardResponse } from "../hooks";
import { useDataSourceContext } from "@/hooks";
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

function DashboardEditName({ updateName }: { updateName: (name: string) => void }) {
  const { dashboardId } = useDataSourceContext();
  const { dashboard, isLoading: dashboardIsLoading } = useDashboardResponse(dashboardId);

  return (
    <div>
      <div className="w-1/2 mr-1">
        <TinyLabel>Name</TinyLabel>
      </div>
      {dashboardIsLoading && (
        <Shimmer height="18px" width="100px" className="mt-2 mb-1" />
      )}
      {!dashboardIsLoading && (
        <Editable
          className="flex-1"
          defaultValue={dashboard?.name}
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

export default DashboardEditName;
