import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from "@chakra-ui/react";
import { memo, useRef } from "react";
import { segment } from "@/lib/track";
import FeedbackPanel from "@/components/FeedbackPanel";
import Image from "next/image";
import React from "react";

const DataSourceTileCreate = ({
  id,
  label,
  beta,
  comingSoon,
  readOnly,
  selectDataSource,
  dataSourceId,
}: {
  id: string;
  label: string;
  beta?: boolean;
  comingSoon?: boolean;
  readOnly?: boolean;
  selectDataSource: (id: string) => Promise<void>;
  dataSourceId: string;
}) => {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const firstFieldRef = useRef(null);

  return (
    <>
      <Popover
        isOpen={isOpen}
        onOpen={comingSoon ? onOpen : undefined}
        onClose={onClose}
        initialFocusRef={firstFieldRef}
      >
        <PopoverTrigger>
          <a
            key={id}
            className="relative block border shadow-md px-12 py-8 rounded text-center overflow-hidden cursor-pointer bg-gradient-to-b from-white to-cool-gray-100 hover:to-blue-gray-200"
            onMouseEnter={() =>
              segment().track("Hovered over new data source type", {
                id,
              })
            }
            onClick={() => {
              segment().track("Selected new data source type", {
                id,
              });
              if (!comingSoon) {
                selectDataSource(id);
              }
            }}
          >
            {beta && (
              <div className="absolute text-center top-0 right-0 m-0 -mt-4 -mr-14 transform rotate-45 uppercase font-bold text-white py-2 pt-8 px-12 bg-green-400 shadow-md text-sm">
                Beta
              </div>
            )}
            {comingSoon && (
              <div className="absolute text-center top-auto bottom-0 right-0 uppercase font-bold text-xs text-white py-1 w-full bg-blue-400">
                Coming soon
              </div>
            )}
            {readOnly && (
              <div className="absolute text-center top-auto bottom-0 right-0 uppercase font-bold text-xs text-white py-1 w-full bg-green-400">
                Read only
              </div>
            )}
            <div className="mb-4">
              <input
                type="radio"
                className="w-5 h-5"
                checked={!comingSoon && id === dataSourceId}
                disabled={comingSoon}
              />
            </div>
            <div className="relative h-12 mb-4">
              <Image
                src={`/img/logos/${id}.png`}
                alt={`New ${id} data-source`}
                layout="fill"
                objectFit="contain"
              />
            </div>
            {label}
          </a>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <FeedbackPanel
            label="We would love to hear from you"
            closePanel={onClose}
            firstFieldRef={firstFieldRef}
          />
        </PopoverContent>
      </Popover>
    </>
  );
};

export default memo(DataSourceTileCreate);
