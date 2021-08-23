import { PostgresDataQuery } from "./types";
import { flatten } from "lodash";
import { schema } from "./schema";
import QueryService from "./QueryService";
import formComponent from "./components/Form";
import queryEditorComponent from "./editor";

const postgresql = {
  id: "postgresql",
  name: "PostgreSQL",
  description: "PostgreSQL data source",
  // queryEditorComponent,
  // formComponent,
  schema,
  // queryService: QueryService,
  queryParams: (dataQuery: PostgresDataQuery): string[] =>
    flatten([dataQuery?.options?.query]),
};

export default postgresql;
