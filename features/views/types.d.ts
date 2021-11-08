export type DecoratedView = View & {
  defaultOrder: { columnName?: string; direction?: OrderDirection };
};
