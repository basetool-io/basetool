import { useRouter } from "next/router";
import NewDataSourceForm, { DefaultValueCredentials } from "@/features/data-sources/components/NewDataSourceForm";
import URI from "urijs";

const New = () => {
  const router = useRouter();

  let credentials: DefaultValueCredentials = { port: 5432 };
  if (router.query.credentials) {
    const uri = URI(router.query.credentials);
    credentials = {
      host: uri.hostname(),
      port: parseInt(uri.port()),
      database: uri.path().replace("/", ""),
      user: uri.username(),
      password: uri.password(),
      useSsl: true,
    };
  }

  let name: string | undefined;
  if (router.query.name) {
    name = router.query.name as string;
  }

  return (
    <NewDataSourceForm
      type="postgresql"
      placeholders={{
        name: "My PostgreSQL DB",
      }}
      defaultValues={{
        name,
        credentials,
      }}
    />
  );
};

export default New;
