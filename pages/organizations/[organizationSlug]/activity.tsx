import {
  Activity as ActivityTypePrisma,
  DataSource,
  User,
  View,
} from "@prisma/client";
import { Avatar, AvatarBadge, Code, Tooltip } from "@chakra-ui/react";
import { DateTime } from "luxon";
import { PlusIcon, RefreshIcon, TrashIcon } from "@heroicons/react/outline";
import { useGetActivitiesQuery } from "@/features/organizations/api-slice";
import { useOrganizationFromProfile } from "@/hooks";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import LoadingOverlay from "@/components/LoadingOverlay";
import OrganizationSidebar from "@/components/OrganizationSidebar";
import PageWrapper from "@/components/PageWrapper";
import React, { useMemo } from "react";
import md5 from "md5";

export type ActivityType = ActivityTypePrisma & {
  dataSource?: DataSource;
  view?: View;
  user: User;
};

const ActivityItem = ({ activity }: { activity: ActivityType }) => {
  const avatarIcon = useMemo(() => {
    switch (activity.action) {
      case "create":
        return <PlusIcon className="w-3 h-3 text-white" />;
      case "bulkDelete":
      case "delete":
        return <TrashIcon className="w-3 h-3 text-white" />;
      case "update":
        return <RefreshIcon className="w-3 h-3 text-white" />;
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

  const message = useMemo(() => {
    switch (activity.action) {
      case "create":
        return (
          <p>
            Record{" "}
            <Code>
              <a href={urlToRecord}>{activity.recordId}</a>
            </Code>{" "}
            created in{" "}
            <Code>
              <a href={urlToSource}>{sourceName}</a>
            </Code>
          </p>
        );
      case "bulkDelete":
        return (
          <p>
            <Tooltip label={activity.recordId} placement="auto">
              <u>Multiple records</u>
            </Tooltip>{" "}
            deleted from{" "}
            <Code>
              <a href={urlToSource}>{sourceName}</a>
            </Code>
          </p>
        );
      case "delete":
        return (
          <p>
            Record <Code>{activity.recordId}</Code> deleted from{" "}
            <Code>
              <a href={urlToSource}>{sourceName}</a>
            </Code>
          </p>
        );
      case "update":
        return (
          <p>
            Record{" "}
            <Code>
              <a href={urlToRecord}>{activity.recordId}</a>
            </Code>{" "}
            updated in{" "}
            <Code>
              <a href={urlToSource}>{sourceName}</a>
            </Code>
          </p>
        );
    }
  }, [activity.action]);

  return (
    <li
      key={activity.id}
      className="py-4 my-2 bg-true-gray-100 shadow-md rounded-md"
    >
      <div className="flex space-x-3 mx-2">
        <div className="h-8 w-8">
          <Avatar
            size="sm"
            name={activity.user.email}
            src={`https://www.gravatar.com/avatar/${md5(activity.user.email)}`}
          >
            <AvatarBadge bg={avatarBadgeColor} boxSize="1.75em">
              {avatarIcon}
            </AvatarBadge>
          </Avatar>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              {activity.user.firstName + " " + activity.user.lastName}
            </h3>
            <p className="text-sm text-gray-500">
              {DateTime.fromISO(activity.createdAt.toString()).toRelative()}
            </p>
          </div>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      </div>
    </li>
  );
};

function Activity() {
  const router = useRouter();
  const organization = useOrganizationFromProfile({
    slug: router.query.organizationSlug as string,
  });

  const {
    data: activitiesResponse,
    isLoading,
    isFetching,
  } = useGetActivitiesQuery(
    {
      organizationId: organization?.id?.toString(),
    },
    { skip: !organization?.id }
  );

  return (
    <Layout sidebar={<OrganizationSidebar organization={organization} />}>
      <PageWrapper crumbs={[organization?.name, "Activity"]} flush={true}>
        <div className="relative flex-1 max-w-full w-full flex">
          {(isLoading || isFetching) && <LoadingOverlay inPageWrapper />}
          <div className="mx-auto px-6">
            <ul role="list">
              {activitiesResponse &&
                activitiesResponse?.data?.length > 0 &&
                activitiesResponse?.data.map((activityItem: ActivityType) => (
                  <ActivityItem activity={activityItem} />
                ))}
              {activitiesResponse && activitiesResponse?.data?.length === 0 && (
                <li className="py-4 my-2 bg-true-gray-100 shadow-md rounded-md">
                  No activity yet
                </li>
              )}
            </ul>
          </div>
          {/* <pre>{JSON.stringify(activitiesResponse?.data, null, 2)}</pre> */}
        </div>
      </PageWrapper>
    </Layout>
  );
}

export default Activity;
