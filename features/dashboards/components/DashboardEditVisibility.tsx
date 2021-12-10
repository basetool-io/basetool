import { Checkbox } from "@chakra-ui/react";
import { useDashboardResponse } from "../hooks";
import { useDataSourceContext } from "@/hooks";
import React from "react";
import Shimmer from "@/components/Shimmer";
import TinyLabel from "@/components/TinyLabel";

function DashboardEditVisibility({
  updateVisibility,
}: {
  updateVisibility: (visible: boolean) => void;
}) {
  const { dashboardId } = useDataSourceContext();
  const { dashboard, isLoading: dashboardIsLoading } = useDashboardResponse(dashboardId);

  return (
    <div>
      <TinyLabel>Visibility</TinyLabel>
      <div className="flex-1 pt-1">
        {dashboardIsLoading && (
          <div className="flex items-center space-x-2">
            <Shimmer height="16px" width="16px" />{" "}
            <Shimmer height="16px" width="150px" className="mt-1 mb-1" />
          </div>
        )}
        {!dashboardIsLoading && (
          <Checkbox
            colorScheme="gray"
            isChecked={dashboard?.isPublic}
            onChange={(e) => updateVisibility(e.currentTarget.checked)}
          >
            Visible to all members
          </Checkbox>
        )}
      </div>
    </div>
  );
}

export default DashboardEditVisibility;
