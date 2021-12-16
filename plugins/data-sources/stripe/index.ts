import { DataSourceInfo } from "../types";

const info: DataSourceInfo = {
  id: "stripe",
  name: "Stripe",
  description: "Stripe",
  readOnly: true,
  pagination: 'cursor',
  supports: {
    filters: false,
    columnsRequest: false,
    views: false,
    dashboards: false,
  },
  runsInProxy: false,
};

export default info;
