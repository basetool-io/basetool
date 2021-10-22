import NewDataSourceForm from "@/features/data-sources/components/NewDataSourceForm";

const New = () => (
  <NewDataSourceForm
    type="mysql"
    placeholders={{
      name: "My MySQL DB",
    }}
    defaultValues={{
      credentials: {
        port: 3306,
      },
    }}
  />
);

export default New;
