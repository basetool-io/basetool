import NewDataSourceForm from "@/features/data-sources/components/NewDataSourceForm";

const New = () => (
  <NewDataSourceForm
    type="maria_db"
    placeholders={{
      name: "My MariaDB database",
    }}
    defaultValues={{
      credentials: {
        port: 3306,
      },
    }}
  />
);

export default New;
