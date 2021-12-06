import {
  ChatAltIcon,
} from "@heroicons/react/outline";
import { DataSourceItem } from "./DataSourcesSidebar";
import { useBoolean, useClickAway } from "react-use";
import FeedbackPanel from "./FeedbackPanel";
import React, { memo, useRef } from "react";

const FeedbackSidebarItem = () => {
  const [feedbackPanelVisible, toggleFeedbackPanelVisible] = useBoolean(false);
  const feedbackButton = useRef(null);
  const feedbackPanel = useRef(null);

  useClickAway(feedbackPanel, (e) => {
    // When a user click the filters button to close the filters panel, the button is still outside,
    // so the action triggers twice closing and opening the filters panel.
    if (
      feedbackButton?.current &&
      !(feedbackButton?.current as any)?.contains(e.target)
    ) {
      toggleFeedbackPanelVisible(false);
    }
  });

  const handleShowFeedbackPanelClick = () => {
    toggleFeedbackPanelVisible();
  };

  return (
    <>
      <div ref={feedbackButton}>
        <DataSourceItem
          active={feedbackPanelVisible}
          icon={<ChatAltIcon className="h-6 w-6 text-white" />}
          label={`Share any feedback or ideas`}
          onClick={handleShowFeedbackPanelClick}
        />
      </div>

      {feedbackPanelVisible && (
        <div
          className="absolute right-auto left-16 bottom-16 z-50 ml-1"
          ref={feedbackPanel}
        >
          <FeedbackPanel closePanel={() => toggleFeedbackPanelVisible(false)} />
        </div>
      )}
    </>
  );
};

export default memo(FeedbackSidebarItem);
