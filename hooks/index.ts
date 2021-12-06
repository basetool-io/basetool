import { AppDispatch, RootState } from "@/lib/store";
import {
  DataSource,
  Organization,
  OrganizationUser,
  User,
} from "@prisma/client";
import { Role } from "@/features/roles/AccessControlService";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import {
  dataSourceIdSelector,
  setDataSourceId,
  setSidebarVisibile as setSidebarVisibileToState,
  setTableName,
  sidebarsVisibleSelector,
  tableNameSelector,
} from "@/features/app/state-slice";
import { isUndefined } from "lodash";
import { segment } from "@/lib/track";
import { useEffect } from "react";
import { useGetProfileQuery } from "@/features/app/api-slice";
import { useMedia } from "react-use";
import { useMemo } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/client";
import { useViewResponse } from "@/features/views/hooks";
import ApiService from "@/features/api/ApiService";

export const useApi = () => new ApiService();
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useResponsive = () => {
  if (!document)
    return { isSm: false, isMd: false, isLg: false, isXl: false, is2xl: false };

  /* eslint-disable react-hooks/rules-of-hooks */
  const isSm = useMedia("(min-width: 640px)", false);
  const isMd = useMedia("(min-width: 768px)", false);
  const isLg = useMedia("(min-width: 1024px)", false);
  const isXl = useMedia("(min-width: 1280px)", false);
  const is2xl = useMedia("(min-width: 1536px)", false);
  /* eslint-enable react-hooks/rules-of-hooks */

  return { isSm, isMd, isLg, isXl, is2xl };
};

export const useSidebarsVisible = (initialvalue?: boolean) => {
  const dispatch = useAppDispatch();
  const sidebarsVisible = useAppSelector(sidebarsVisibleSelector);

  const setSidebarsVisible = (value: boolean) => {
    dispatch(setSidebarVisibileToState(value));
  };

  useEffect(() => {
    if (initialvalue) setSidebarsVisible(initialvalue);
  }, []);

  return [sidebarsVisible, setSidebarsVisible] as const;
};

export const useOrganizationFromProfile = ({
  id,
  slug,
}: {
  id?: number;
  slug?: string;
}):
  | (Organization & {
      users: Array<OrganizationUser & { user: User }>;
    })
  | undefined => {
  const { organizations } = useProfile();
  const organization = useMemo(
    () =>
      organizations?.find((o) => {
        if (slug) return o.slug === slug;
        if (id) return o.id === id;
      }),
    [organizations, id, slug]
  );

  return organization;
};

export const useProfile = () => {
  const [session, sessionIsLoading] = useSession();
  const { data: profileResponse, isLoading: profileIsLoading } =
    useGetProfileQuery(null, {
      skip: !session,
    });

  const { user, organizations, role } = useMemo<{
    user: User;
    organizations: Array<
      Organization & {
        users: Array<OrganizationUser & { user: User; role: Role }>;
        dataSources: DataSource[];
      }
    >;
    role: Role;
  }>(
    () =>
      profileResponse?.ok
        ? profileResponse?.data
        : { user: {}, organizations: [], role: undefined },
    [profileResponse, profileIsLoading]
  );

  const isLoading = useMemo<boolean>(
    () => sessionIsLoading || profileIsLoading,
    [sessionIsLoading, profileIsLoading]
  );

  return { user, role, organizations, isLoading, session };
};

export const useDataSourceContext = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const dataSourceId = useAppSelector(dataSourceIdSelector);
  const tableName = useAppSelector(tableNameSelector);

  const viewId = router.query.viewId as string;
  const { view } = useViewResponse(viewId);

  useEffect(() => {
    if (view?.dataSourceId)
      dispatch(setDataSourceId(view.dataSourceId.toString()));
    if (view?.tableName) dispatch(setTableName(view.tableName));
  }, [view]);

  useEffect(() => {
    if (router.query.dataSourceId) {
      dispatch(setDataSourceId(router.query.dataSourceId as string));
      if (router.query.tableName) {
        dispatch(setTableName(router.query.tableName as string));
      } else {
        // When navigating from a dataSource to another, the dataSourceId updates but tableName doesn't and keeps the table selected, so we have to reset it.
        dispatch(setTableName(""));
      }
    } else if (router.pathname === "/") {
      dispatch(setDataSourceId(""));
    }
  }, [
    router.pathname,
    router.query.dataSourceId,
    router.query.tableName,
    router.query.viewId,
  ]);

  const recordId = useMemo(
    () => router.query.recordId as string,
    [router.query.recordId]
  );
  const tableIndexPath = useMemo(
    () =>
      isUndefined(viewId)
        ? `/data-sources/${dataSourceId}/tables/${tableName}`
        : `/views/${viewId}`,
    [dataSourceId, tableName, viewId]
  );
  const recordsPath = useMemo(
    () => (isUndefined(viewId) ? tableIndexPath : `${tableIndexPath}/records`),
    [tableIndexPath, viewId]
  );
  const newRecordPath = useMemo(
    () => (recordsPath ? `${recordsPath}/new` : null),
    [recordsPath]
  );

  return {
    dataSourceId,
    tableName,
    viewId,
    recordId,
    tableIndexPath,
    recordsPath,
    newRecordPath,
  };
};

/*
  This hook can be used in two ways.

  1. On the spot and the event will be sent then and there
    -> useSegment({event: 'Added data source', {id}})
  2. At a later date; It returns the `track` method that you can use at a later date to track something.
    -> const track = useSegment()
*/
export const useSegment = (
  event?: string,
  properties?: Record<string, unknown>
) => {
  const { session, isLoading } = useProfile();
  const track = (event: string, properties?: Record<string, unknown>) =>
    segment().track(event, properties);

  useEffect(() => {
    // If event was passed trigger the tracking action right away
    if (!isLoading && session && event) {
      track(event, properties);
    }
  }, [isLoading, session]);

  // return the track method to be used at a later time
  return track;
};
