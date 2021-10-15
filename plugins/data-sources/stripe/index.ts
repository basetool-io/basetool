import { DataSourceInfo } from "../types";

const info: DataSourceInfo = {
  id: "stripe",
  name: "Stripe",
  description: "Stripe",
  readOnly: true,
  supports: {
    filters: false,
    columnsRequest: false,
  },
};

export default info;
