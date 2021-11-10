export type DecoratedView = View & {
  defaultOrder: OrderParams[];
};

export type OrderParams = { columnName?: string; direction?: OrderDirection };
