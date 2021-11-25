import { DataSourceInfo } from "@/plugins/data-sources/types";
import { OWNER_ROLE } from "../roles";
import { useMemo } from "react";
import { useProfile } from "@/hooks";
import AccessControlService from "@/features/roles/AccessControlService";

export const useAccessControl = () => {
  const { role } = useProfile();
  const ac = useMemo(() => new AccessControlService(role), [role]);

  return ac;
};

export const useACLHelpers = ({
  dataSourceInfo,
  viewId,
}: {
  dataSourceInfo?: DataSourceInfo;
  viewId?: string;
}) => {
  const ac = useAccessControl();
  const { isLoading: profileIsLoading } = useProfile();
  const isOwner = useMemo(() => ac.hasRole(OWNER_ROLE), [ac]);

  const canView = useMemo(() => {
    if (profileIsLoading) return true;

    return ac.readAny("record").granted;
  }, [ac]);
  const canEdit = useMemo(() => {
    if (profileIsLoading) return true;

    return ac.updateAny("record").granted && !dataSourceInfo?.readOnly;
  }, [ac, dataSourceInfo]);
  const canDelete = useMemo(() => {
    if (profileIsLoading) return true;

    return ac.deleteAny("record").granted && !dataSourceInfo?.readOnly;
  }, [ac, dataSourceInfo]);
  const canBulkDelete = useMemo(() => {
    if (profileIsLoading) return true;

    return ac.deleteAny("record").granted && !dataSourceInfo?.readOnly;
  }, [ac, dataSourceInfo]);

  const canCreate = useMemo(() => {
    if (profileIsLoading) return true;

    return ac.createAny("record").granted && !dataSourceInfo?.readOnly;
  }, [ac, dataSourceInfo]);

  const canCreateView = useMemo(() => {
    if (profileIsLoading) return true;

    return !viewId && ac.hasRole(OWNER_ROLE) && !dataSourceInfo?.readOnly;
  }, [viewId, ac, dataSourceInfo]);

  const canEditView = useMemo(() => {
    if (profileIsLoading) return true;

    return viewId && ac.hasRole(OWNER_ROLE);
  }, [viewId, ac]);

  return {
    canView,
    canEdit,
    canDelete,
    canBulkDelete,
    canCreate,
    canCreateView,
    canEditView,
    isOwner,
  };
};
