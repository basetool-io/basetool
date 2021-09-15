import React from "react";

function Shimmer({ width = 100 }: { width?: number }) {
  const styles = {
    width
  }

return <div className="shimmer-bg content-line" style={styles}></div>;
}

export default Shimmer;
