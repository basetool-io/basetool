import { Field } from "@/features/fields/types";

const useForeignName = (field: Field) => {
  const getForeignName = (record: any) => {
    const nameColumn: any = field?.column?.fieldOptions?.nameColumn;
    if (record && nameColumn) {
      return `${record[nameColumn]} (${record.id})`;
    }

    return null;
  };

  return getForeignName;
};

export { useForeignName };
