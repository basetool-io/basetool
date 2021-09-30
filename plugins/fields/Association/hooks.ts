import { Field } from "@/features/fields/types";

const useForeignName = (field: Field) => {
  const getForeignName = (record: any) => {
    const nameColumn: any = field?.column?.fieldOptions?.nameColumn;
    if (record && nameColumn) {
      if (nameColumn === "id") return `${record[nameColumn]}`;

      return `${record[nameColumn]} (${record.id})`;
    }

    if (record && record.id) return `${record.id}`;

    return null;
  };

  return getForeignName;
};

export { useForeignName };
