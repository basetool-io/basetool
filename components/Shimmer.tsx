import React, { memo } from "react";
import classNames from "classnames";

function Shimmer({
  width = "100%",
  height = "auto",
  className = "",
}: {
  width?: string | number;
  height?: string | number;
  className?: string;
}) {
  const styles = {
    width,
    height,
  };

  return (
    <div
      className={classNames("shimmer-bg rounded-md", className)}
      style={styles}
    />
  );
}

export default memo(Shimmer);
