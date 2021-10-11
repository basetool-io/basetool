import { AppDispatch, RootState } from "@/lib/store";
import {
  DataSource,
  Organization,
  OrganizationUser,
  User,
} from "@prisma/client";
import { IFilter, IFilterGroup } from "@/features/tables/components/Filter";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import {
  allFiltersAppliedSelector,
  appliedFiltersSelector,
  filtersSelector,
  removeFilter,
  resetRecordsSelection as resetRecordsSelectionInState,
  selectedRecordsSelector,
  setAppliedFilters,
  setFilters,
  setRecordsSelected as setRecordsSelectedInState,
  toggleRecordSelection as toggleRecordSelectionInState,
  updateFilter,
} from "@/features/records/state-slice";
import { encodeObject } from "@/lib/encoding";
import { segment } from "@/lib/track"
import {
  setSidebarVisibile as setSidebarVisibileToState,
  sidebarsVisibleSelector,
} from "@/features/app/state-slice";
import { useEffect } from "react";
import { useGetProfileQuery } from "@/features/profile/api-slice";
import { useMedia } from "react-use";
import { useMemo } from "react";
import { useSession } from "next-auth/client";
import AccessControlService, {
  Role,
} from "@/features/roles/AccessControlService";
import ApiService from "@/features/api/ApiService";
import store from "@/lib/store";

export const useApi = () => new ApiService();
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useFilters = (
  initialFilters?: string | undefined
): {
  filters: Array<IFilter | IFilterGroup>;
  setFilters: (filters: Array<IFilter | IFilterGroup>) => void;
  appliedFilters: Array<IFilter | IFilterGroup>;
  applyFilters: (filters: Array<IFilter | IFilterGroup>) => void;
  allFiltersApplied: boolean;
  removeFilter: (idx: number) => void;
  updateFilter: (idx: number, filter: IFilter | IFilterGroup) => void;
  resetFilters: () => void;
  encodedFilters: string;
} => {
  // const router = useRouter()
  const filters = useAppSelector(filtersSelector);
  const appliedFilters = useAppSelector(appliedFiltersSelector);
  const allFiltersApplied = useAppSelector(allFiltersAppliedSelector);

  // useEffect(() => {
  //   console.log('useEffect->', initialFilters)

  //   if (initialFilters) {
  //     let decodedFilters
  //     try {
  //       decodedFilters = decodeObject(initialFilters)
  //     } catch (error) {
  //       console.log('error->', error)
  //     }
  //     console.log('decodedFilters->', decodedFilters, initialFilters)

  //     if (decodedFilters) store.dispatch(setFilters(decodedFilters))
  //   }

  // }, [])

  const setTheFilters = (filters: Array<IFilter | IFilterGroup>) => {
    store.dispatch(setFilters(filters));
  };

  const removeTheFilter = (idx: number) => {
    store.dispatch(removeFilter(idx));
  };

  const updateTheFilter = (idx: number, filter: IFilter | IFilterGroup) => {
    store.dispatch(updateFilter({ idx, filter }));
  };

  const resetFilters = () => {
    store.dispatch(setFilters([]));
    store.dispatch(setAppliedFilters([]));

    // router.push({
    //   pathname: router.pathname,
    //   query: {
    //     ...router.query,
    //     filters: null,
    //   },
    // });
  };

  const encodedFilters = useMemo(() => {
    return appliedFilters ? encodeObject(appliedFilters) : "";
  }, [appliedFilters]);
  // console.log('encodedFilters->', encodedFilters)

  const applyFilters = (filters: Array<IFilter | IFilterGroup>) => {
    // router.push({
    //   pathname: router.pathname,
    //   query: {
    //     ...router.query,
    //     filters: encodeObject(filters),
    //   },
    // });
    store.dispatch(setAppliedFilters(filters));
  };

  return {
    filters,
    appliedFilters,
    setFilters: setTheFilters,
    applyFilters,
    allFiltersApplied,
    removeFilter: removeTheFilter,
    updateFilter: updateTheFilter,
    resetFilters,
    encodedFilters,
  };
};

export const useAccessControl = () => {
  const { role } = useProfile();
  const ac = useMemo(() => new AccessControlService(role), [role]);

  return ac;
};

export const useResponsive = () => {
  const isSm = useMedia("(min-width: 640px)", false);
  const isMd = useMedia("(min-width: 768px)", false);
  const isLg = useMedia("(min-width: 1024px)", false);
  const isXl = useMedia("(min-width: 1280px)", false);
  const is2xl = useMedia("(min-width: 1536px)", false);

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

export const useOrganizationFromContext = ({
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

export const useSelectRecords = () => {
  const dispatch = useAppDispatch();
  const selectedRecords = useAppSelector(selectedRecordsSelector);

  const toggleRecordSelection = (value: number) => {
    dispatch(toggleRecordSelectionInState(value));
  };

  const setRecordsSelected = (values: number[]) => {
    dispatch(setRecordsSelectedInState(values));
  };

  const resetRecordsSelection = () => {
    dispatch(resetRecordsSelectionInState());
  };

  return {
    selectedRecords,
    toggleRecordSelection,
    setRecordsSelected,
    resetRecordsSelection,
  };
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
        users: Array<OrganizationUser & { user: User }>;
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

/*
  This hook can be used in two ways.

  1. On the spot and the event will be sent then and there
    -> useSegment({event: 'Added data source', {id}})
  2. At a later date; It returns the `track` method that you can use at a later date to track something.
    -> const track = useSegment()
*/
export const useSegment = (event?: string, properties?: Record<string, unknown>) => {
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
