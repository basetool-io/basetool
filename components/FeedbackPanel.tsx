import { ArrowRightIcon } from "@heroicons/react/outline";
import { Button, IconButton, Textarea } from "@chakra-ui/react";
import { isEmpty } from "lodash";
import { useRouter } from "next/router";
import { useSendFeedbackMutation } from "@/features/app/api-slice";
import React, { memo, useState } from "react";
import TinyLabel from "./TinyLabel";

const FeedbackPanel = ({
  label = "Feedback",
  closePanel,
  firstFieldRef,
}: {
  label?: string;
  closePanel?: () => void;
  firstFieldRef?: any;
}) => {
  const [emotion, setEmotion] = useState<string | null>(null);
  const [value, setValue] = useState<string | null>(null);
  const [sendFeedback, { isLoading }] = useSendFeedbackMutation();
  const router = useRouter();

  const handleSendFeedback = async () => {
    if (closePanel) closePanel();

    await sendFeedback({
      body: {
        note: value ? value : "",
        emotion: emotion ? emotion : "",
        url: router.pathname ? router.pathname : "",
      },
    }).unwrap();
  };

  return (
    <div className="border rounded-md shadow-lg bg-white z-30 p-4 space-y-2">
      <TinyLabel>{label}</TinyLabel>
      <Textarea
        value={value ? value : undefined}
        onChange={(e) => setValue(e.currentTarget.value)}
        placeholder="Your feedback..."
        size="sm"
        className="text-black"
        resize="none"
        autoFocus={true}
        ref={firstFieldRef}
      />
      <hr />
      <div className="flex justify-between">
        <div className="space-x-1">
          <IconButton
            size="sm"
            className={`border hover:border-gray-500 ${
              emotion === "😻" ? "border-palatinate-blue " : ""
            }`}
            aria-label="star"
            icon={<p className="text-2xl mt-[1px]">😻</p>}
            onClick={() => setEmotion("😻")}
          />
          <IconButton
            size="sm"
            className={`border hover:border-gray-500 ${
              emotion === "😸" ? "border-palatinate-blue " : ""
            }`}
            aria-label="happy"
            icon={<p className="text-2xl mt-[1px]">😸</p>}
            onClick={() => setEmotion("😸")}
          />
          <IconButton
            size="sm"
            className={`border hover:border-gray-500 ${
              emotion === "😿" ? "border-palatinate-blue " : ""
            }`}
            aria-label="sad"
            icon={<p className="text-2xl mt-[1px]">😿</p>}
            onClick={() => setEmotion("😿")}
          />
          <IconButton
            size="sm"
            className={`border hover:border-gray-500 ${
              emotion === "😾" ? "border-palatinate-blue " : ""
            }`}
            aria-label="cry"
            icon={<p className="text-2xl mt-[1px]">😾</p>}
            onClick={() => setEmotion("😾")}
          />
        </div>
        <Button
          size="sm"
          colorScheme="blue"
          onClick={handleSendFeedback}
          isDisabled={isEmpty(value)}
          isLoading={isLoading}
          rightIcon={<ArrowRightIcon className="h-3" />}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default memo(FeedbackPanel);
