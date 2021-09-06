import { AppDispatch, RootState } from "@/lib/store";
import { Filter } from "@/features/tables/components/FilterRow";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import {
  allFiltersAppliedSelector,
  appliedFiltersSelector,
  filtersSelector,
  removeFilter,
  setAppliedFilters,
  setFilters,
  updateFilter,
} from "@/features/records/state-slice";
import { encodeObject } from "@/lib/encoding"
import { useMemo } from "react"
import ApiService from "@/features/api/ApiService";
import store from "@/lib/store";

export const useApi = () => new ApiService();
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useFilters = (initialFilters?: string | undefined): {
  filters: Filter[];
  setFilters: (filters: Filter[]) => void;
  appliedFilters: Filter[];
  applyFilters: (filters: Filter[]) => void;
  allFiltersApplied: boolean;
  removeFilter: (idx: number) => void;
  updateFilter: (idx: number, filter: Filter) => void;
  resetFilters: () => void;
  encodedFilters: string
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

  const setTheFilters = (filters: Filter[]) => {
    store.dispatch(setFilters(filters));
  };

  const removeTheFilter = (idx: number) => {
    store.dispatch(removeFilter(idx));
  };

  const updateTheFilter = (idx: number, filter: Filter) => {
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

  const applyFilters = (filters: Filter[]) => {
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
