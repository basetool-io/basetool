import NewDataSourceForm from "@/features/data-sources/components/NewDataSourceForm";

const New = () => (
  <NewDataSourceForm
    type="postgresql"
    placeholders={{
      name: "My PostgreSQL DB",
    }}
    defaultValues={{
      credentials: {
        port: 5432,
      },
    }}
  />
);

export default New;
