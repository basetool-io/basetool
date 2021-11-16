import React, { memo } from "react";
import Shimmer from "@/components/Shimmer";
import pluralize from "pluralize";

const ShimmerOrCount = ({
  item,
  count,
  isLoading,
}: {
  item: string;
  count: number;
  isLoading: boolean;
}) => {
  return (
    <>
      {isLoading && (
        <Shimmer height="16px" width="60px" className="inline-block" />
      )}
      {isLoading || (
        <>
          {count} {pluralize(item, count)}
        </>
      )}
    </>
  );
};

export default memo(ShimmerOrCount);
