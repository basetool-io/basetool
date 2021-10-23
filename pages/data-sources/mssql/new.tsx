import NewDataSourceForm from "@/features/data-sources/components/NewDataSourceForm";

const New = () => (
  <NewDataSourceForm
    type="mssql"
    placeholders={{
      name: "My MSSQL database",
    }}
    defaultValues={{
      credentials: {
        port: 1433,
      },
    }}
  />
);

export default New;
