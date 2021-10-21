import { AnySchema } from "joi";
import { schema as mysqlSchema } from "./mysql/schema";
import { schema as postgresqlSchema } from "./postgresql/schema";

const getSchema = (id: string): AnySchema => {
  switch (id) {
    case "mysql":
    case "maria_db":
      return mysqlSchema;
    case "postgresql":
    default:
      return postgresqlSchema;
  }
};

export default getSchema;
