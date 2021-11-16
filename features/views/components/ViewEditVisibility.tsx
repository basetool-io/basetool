import { Checkbox } from "@chakra-ui/react";
import { useDataSourceContext } from "@/hooks";
import { useGetViewQuery } from "../api-slice";
import React, { useMemo } from "react";
import Shimmer from "@/components/Shimmer";
import TinyLabel from "@/components/TinyLabel";

function ViewEditVisibility({
  updateVisibility,
}: {
  updateVisibility: (visible: boolean) => void;
}) {
  const { viewId } = useDataSourceContext();
  const { data: viewResponse, isLoading: viewIsLoading } = useGetViewQuery(
    { viewId },
    { skip: !viewId }
  );

  const view = useMemo(() => viewResponse?.data, [viewResponse]);

  return (
    <div>
      <TinyLabel>Visibility</TinyLabel>
      <div className="flex-1 pt-1">
        {viewIsLoading && (
          <div className="flex items-center space-x-2">
            <Shimmer height="16px" width="16px" />{" "}
            <Shimmer height="16px" width="150px" className="mt-1 mb-1" />
          </div>
        )}
        {!viewIsLoading && (
          <Checkbox
            colorScheme="gray"
            isChecked={view.public}
            onChange={(e) => updateVisibility(e.currentTarget.checked)}
          >
            Visible to all members
          </Checkbox>
        )}
      </div>
    </div>
  );
}

export default ViewEditVisibility;
