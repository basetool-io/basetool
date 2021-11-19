import { ActivityType } from "@/features/activity/types";
import { isEmpty } from "lodash";
import { useGetActivitiesQuery } from "@/features/organizations/api-slice";
import { useOrganizationFromProfile } from "@/hooks";
import { useRouter } from "next/router";
import ActivityItem from "@/features/activity/components/ActivityItem";
import Layout from "@/components/Layout";
import LoadingOverlay from "@/components/LoadingOverlay";
import OffsetPaginationComponent from "@/features/tables/components/OffsetPaginationComponent";
import OrganizationSidebar from "@/components/OrganizationSidebar";
import PageWrapper from "@/components/PageWrapper";
import React, { useMemo, useState } from "react";

function Activity() {
  const router = useRouter();
  const organization = useOrganizationFromProfile({
    slug: router.query.organizationSlug as string,
  });

  const page = useMemo(() => {
    if (router.query.page) return parseInt(router.query.page as string);

    return 1;
  }, [router.query.page]);

  const perPage = useMemo(() => {
    if (router.query.perPage) return parseInt(router.query.perPage as string);

    return 24;
  }, [router.query.perPage]);

  const [count, setCount] = useState<number | null>(null);

  const {
    data: activitiesResponse,
    isLoading,
    isFetching,
  } = useGetActivitiesQuery(
    {
      organizationId: organization?.id?.toString(),
      page: page.toString(),
      perPage: perPage.toString(),
    },
    { skip: !organization?.id }
  );

  const maxPages = useMemo(() => {
    if (activitiesResponse?.meta?.count) {
      setCount(activitiesResponse.meta.count);

      return Math.ceil(activitiesResponse.meta.count / perPage);
    }

    return 1;
  }, [activitiesResponse]);

  const activities = useMemo(() => {
    return activitiesResponse?.ok ? activitiesResponse.data : [];
  }, [activitiesResponse])

  return (
    <Layout sidebar={<OrganizationSidebar organization={organization} />}>
      <PageWrapper crumbs={[organization?.name, "Activity"]} flush={true}>
        <>
          <div className="relative flex-1 max-w-full w-full flex">
            {(isLoading || isFetching) && <LoadingOverlay inPageWrapper />}
            <div className="mx-auto px-1">
              <ul role="list" className="">
                {!isEmpty(activities) &&
                  activities.map(
                    (activityItem: ActivityType, idx: number) => (
                      <ActivityItem
                        activity={activityItem}
                        lastItem={idx === activitiesResponse?.data?.length - 1}
                      />
                    )
                  )}
                {isEmpty(activities) && (
                    <li className="py-4 my-2">No activity logged yet!</li>
                  )}
              </ul>
            </div>
          </div>
          <OffsetPaginationComponent
            page={page}
            perPage={perPage}
            offset={page === 1 ? 0 : (page - 1) * perPage}
            nextPage={() =>
              router.push(
                `/organizations/${
                  router.query.organizationSlug as string
                }/activity?page=${page + 1}&perPage=${perPage}`
              )
            }
            previousPage={() =>
              router.push(
                `/organizations/${
                  router.query.organizationSlug as string
                }/activity?page=${page - 1}&perPage=${perPage}`
              )
            }
            maxPages={maxPages}
            canPreviousPage={page > 1}
            canNextPage={page < maxPages}
            recordsCount={count ? count : 0}
          />
        </>
      </PageWrapper>
    </Layout>
  );
}

export default Activity;
