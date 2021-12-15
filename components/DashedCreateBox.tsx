import { PlusIcon } from "@heroicons/react/outline";
import React from "react";

function DashedCreateBox({title} : {title: string}) {
  return (
    <div className="flex justify-center items-center border-2 rounded-md border-dashed border-gray-500 py-6 text-gray-600 cursor-pointer mb-2">
      <PlusIcon className="h-4 mr-1 flex flex-shrink-0" />
      {title}
    </div>
  );
}

export default DashedCreateBox;
