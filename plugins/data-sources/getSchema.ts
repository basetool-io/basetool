import { AnySchema } from 'joi'

const getSchema = async (id: string): Promise<AnySchema | undefined> => {
  try {
    return (
      await import(`@/plugins/data-sources/${id}/schema.ts`)
    ).default;
  } catch (error) {
  }
};

export default getSchema;
