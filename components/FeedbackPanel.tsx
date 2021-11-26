import { ArrowRightIcon } from "@heroicons/react/outline";
import { Button, IconButton, Textarea } from "@chakra-ui/react";
import { isEmpty, isUndefined } from "lodash";
import { useRouter } from "next/router";
import { useSendFeedbackMutation } from "@/features/app/api-slice";
import React, { memo, useState } from "react";
import TinyLabel from "./TinyLabel";

const FeedbackPanel = ({ closePanel }: { closePanel?: () => void }) => {
  const [emotion, setEmotion] = useState<string | null>(null);
  const [value, setValue] = useState<string | null>(null);
  const [sendFeedback, { isLoading }] = useSendFeedbackMutation();
  const router = useRouter();

  const handleSendFeedback = async () => {
    const res = await sendFeedback({
      body: {
        note: value ? value : "",
        emotion: emotion ? emotion : "",
        url: router.pathname ? router.pathname : "",
      },
    });

    if (res && res?.data && res?.data?.ok) {
      if (!isUndefined(closePanel)) closePanel();
    }
  };

  return (
    <div className="border rounded-md shadow-lg bg-white z-30 p-4 ml-1 space-y-1">
      <TinyLabel>Feedback</TinyLabel>
      <Textarea
        value={value ? value : undefined}
        onChange={(e) => setValue(e.currentTarget.value)}
        placeholder="Your feedback..."
        size="sm"
        className="text-black"
        resize="none"
      />
      <hr />
      <div className="flex justify-between">
        <div className="space-x-1">
          <IconButton
            size="xs"
            className={`border hover:border-gray-500 ${
              emotion === "😻" ? "border-palatinate-blue " : ""
            }`}
            aria-label="star"
            icon={<p>😻</p>}
            onClick={() => setEmotion("😻")}
          />
          <IconButton
            size="xs"
            className={`border hover:border-gray-500 ${
              emotion === "😸" ? "border-palatinate-blue " : ""
            }`}
            aria-label="happy"
            icon={<p>😸</p>}
            onClick={() => setEmotion("😸")}
          />
          <IconButton
            size="xs"
            className={`border hover:border-gray-500 ${
              emotion === "😿" ? "border-palatinate-blue " : ""
            }`}
            aria-label="sad"
            icon={<p>😿</p>}
            onClick={() => setEmotion("😿")}
          />
          <IconButton
            size="xs"
            className={`border hover:border-gray-500 ${
              emotion === "😾" ? "border-palatinate-blue " : ""
            }`}
            aria-label="cry"
            icon={<p>😾</p>}
            onClick={() => setEmotion("😾")}
          />
        </div>
        <Button
          size="xs"
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
