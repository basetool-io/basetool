
export type View = {
  id: number;
  name: string;
  public: boolean;
  createdBy: number;
  organizationId: number;
  dataSourceId: number;
  tableName: string;
  filters: Record<string, any>;
};
