import { ActivityType } from "@/features/activity/types";
import {
  ArrowRightIcon,
  BanIcon,
  PlusIcon,
  RefreshIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import { Avatar, AvatarBadge, Code, Tooltip } from "@chakra-ui/react";
import { DateTime } from "luxon";
import { isEmpty, isNull, isUndefined } from "lodash";
import React, { ElementType, useMemo } from "react";
import md5 from "md5";

const ActivityChanges = ({activityChanges} : {activityChanges: Record<string, any>[]}) => {
  if (isEmpty(activityChanges)) return null;

  const prettyValue = (change: any) => {
    if (isUndefined(change))
      return <span className="text-xs uppercase">Undefined</span>;
    if (isNull(change)) return <span className="text-xs uppercase">Null</span>;
    if (isEmpty(change))
      return <span className="text-xs uppercase">Empty</span>;

    if (typeof change === "object") return JSON.stringify(change, null, 2);

    return change;
  };

  return (
    <>
      <span className="text-xs font-bold uppercase text-gray-800 leading-none">
        Changes
      </span>
      <ul className="space-y-1">
        {activityChanges &&
          activityChanges.map(
            (change: Record<string, any>, idx: number) => {
              return (
                <li key={idx}>
                  <span className="text-xs mr-1 font-semibold">
                    {change.column}
                  </span>{" "}
                  <br />
                  <span className="text-gray-700">
                    {prettyValue(change.before)}
                  </span>{" "}
                  <ArrowRightIcon className="h-3 w-3 inline mb-1 mx-1" />{" "}
                  <span className="text-gray-900">
                    {prettyValue(change.after)}
                  </span>
                </li>
              );
            }
          )}
      </ul>
    </>
  );
}

const ActivityItem = ({
  activity,
  lastItem = false,
}: {
  activity: ActivityType;
  lastItem?: boolean;
}) => {
  const AvatarIcon: ElementType = useMemo(() => {
    switch (activity.action) {
      case "create":
        return PlusIcon;
      case "bulkDelete":
      case "delete":
        return TrashIcon;
      case "update":
        return RefreshIcon;
      default:
        return BanIcon;
    }
  }, [activity.action]);

  const avatarBadgeColor = useMemo(() => {
    switch (activity.action) {
      case "create":
        return "green";
      case "bulkDelete":
      case "delete":
        return "red";
      case "update":
        return "blue";
    }
  }, [activity.action]);

  const urlToSource = useMemo(
    () =>
      activity?.view
        ? `/views/${activity.view.id}`
        : `/data-sources/${activity?.dataSource?.id}/tables/${activity.tableName}`,
    [activity?.view, activity?.dataSource, activity.tableName]
  );

  const urlToRecord = useMemo(
    () =>
      activity?.view
        ? `${urlToSource}/records/${activity.recordId}`
        : `${urlToSource}/${activity.recordId}`,
    [urlToSource, activity.recordId]
  );

  const sourceName = useMemo(
    () =>
      activity?.view
        ? activity?.view.name
        : activity.dataSource?.name + "/" + activity.tableName,
    [activity?.view, activity?.dataSource, activity.tableName]
  );

  const userName = useMemo(
    () =>
      activity.user.firstName && activity.user.lastName
        ? activity.user.firstName + " " + activity.user.lastName
        : activity.user.email,
    [activity.user.firstName, activity.user.lastName, activity.user.email]
  );

  const CreateMessage = () => {
    return (
      <p>
        Created record{" "}
        <Code>
          <a href={urlToRecord}>{activity.recordId}</a>
        </Code>{" "}
        in{" "}
        <Code>
          <a href={urlToSource}>{sourceName}</a>
        </Code>
      </p>
    );
  };

  const BulkDeleteMessage = () => {
    return (
      <p>
        Deleted{" "}
        <Tooltip label={activity.recordId} placement="auto">
          <u>multiple records</u>
        </Tooltip>{" "}
        from{" "}
        <Code>
          <a href={urlToSource}>{sourceName}</a>
        </Code>
      </p>
    );
  };

  const DeleteMessage = () => {
    return (
      <p>
        Deleted record <Code>{activity.recordId}</Code> from{" "}
        <Code>
          <a href={urlToSource}>{sourceName}</a>
        </Code>
      </p>
    );
  };

  const UpdateMessage = () => {
    return (
      <p>
        Updated record{" "}
        <Code>
          <a href={urlToRecord}>{activity.recordId}</a>
        </Code>{" "}
        in{" "}
        <Code>
          <a href={urlToSource}>{sourceName}</a>
        </Code>
      </p>
    );
  };

  const message = useMemo(() => {
    switch (activity.action) {
      case "create":
        return <CreateMessage />;
      case "bulkDelete":
        return <BulkDeleteMessage />;
      case "delete":
        return <DeleteMessage />;
      case "update":
        return <UpdateMessage />;
    }
  }, [activity.action]);

  const activityChanges: Record<string, any>[] = useMemo(() => {
    return activity.changes as Record<string, any>[];
  }, [activity.changes]);

  return (
    <li
      key={activity.id}
      className="relative py-4 my-2 rounded-md sm:w-[28rem] lg:w-[36rem]"
    >
      {!lastItem && (
        <span
          className="absolute top-5 left-8 -ml-px h-full w-0.5 bg-gray-200"
          aria-hidden="true"
        />
      )}
      <div className="flex space-x-3 mx-2">
        <div className="h-12 w-12">
          <Avatar
            size="md"
            name={activity.user.email}
            src={`https://www.gravatar.com/avatar/${md5(activity.user.email)}`}
            className="border-4 border-white"
          >
            <AvatarBadge bg={avatarBadgeColor} boxSize="1.25em">
              <AvatarIcon className="w-3 h-3 text-white" />
            </AvatarBadge>
          </Avatar>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">{userName}</h3>
            <p className="text-sm text-gray-500">
              {DateTime.fromISO(activity.createdAt.toString()).toRelative()}
            </p>
          </div>
          <p className="text-sm text-gray-500">{message}</p>
          <ActivityChanges activityChanges={activityChanges} />
        </div>
      </div>
    </li>
  );
};

export default ActivityItem;
