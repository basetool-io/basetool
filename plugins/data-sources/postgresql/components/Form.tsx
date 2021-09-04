import {
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { joiResolver } from "@hookform/resolvers/joi";
import { schema } from "../schema";
import {
  useAddDataSourceMutation,
  useUpdateDataSourceMutation,
} from "@/features/data-sources/api-slice";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import PageWrapper from "@/features/records/components/PageWrapper";
import React, { useState } from "react";

export interface IFormFields {
  id?: number;
  name: string;
  type: "postgresql";
  credentials: {
    url: string;
    useSsl: boolean;
  };
}

function Form({ data }: { data?: IFormFields }) {
  const whenCreating = !data?.id;
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [addDataSource] = useAddDataSourceMutation();
  const [updateDataSource] = useUpdateDataSourceMutation();

  const onSubmit = async (formData: IFormFields) => {
    setIsLoading(true);

    let response;
    try {
      if (whenCreating) {
        response = await addDataSource({ body: formData }).unwrap();
      } else {
        if (!data?.id) {
          setIsLoading(false);

          return;
        }

        response = await updateDataSource({
          dataSourceId: data?.id.toString(),
          tableName: router.query.tableName as string,
          body: formData,
        }).unwrap();
      }
    } catch (error) {
      setIsLoading(false);
    }

    setIsLoading(false);

    if (response && response.ok && whenCreating) {
      router.push(`/data-sources/${response.data.id}`);
    }
  };

  const { register, handleSubmit, formState } = useForm({
    resolver: joiResolver(schema),
  });

  const options = [
    {
      id: "postgresql",
      label: "PostgreSQL",
      enabled: true,
    },
    // {
    //   id: "mssql",
    //   label: "MSSQL (coming soon)",
    //   enabled: false,
    // },
    // {
    //   id: "my_sql",
    //   label: "MySQL (coming soon)",
    //   enabled: false,
    // },
    // {
    //   id: "maria_db",
    //   label: "MariaDB (coming soon)",
    //   enabled: false,
    // },
    // {
    //   id: "sq_lite3",
    //   label: "SQLite3 (coming soon)",
    //   enabled: false,
    // },
    // {
    //   id: "oracle",
    //   label: "Oracle (coming soon)",
    //   enabled: false,
    // },
    // {
    //   id: "amazon_redshift",
    //   label: "Amazon Redshift (coming soon)",
    //   enabled: false,
    // },
    // {
    //   id: "airtable",
    //   label: "Airtable (coming soon)",
    //   enabled: false,
    // },
    // {
    //   id: "google_sheets",
    //   label: "Google Sheets (coming soon)",
    //   enabled: false,
    // },
  ];

  return (
    <PageWrapper heading="Add data source">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormControl id="name">
          <FormLabel>Name</FormLabel>
          <Input
            type="string"
            placeholder="My Postgres DB"
            {...register("name")}
          />
          <FormHelperText>The name of your data source.</FormHelperText>
        </FormControl>

        <FormControl id="url">
          <FormLabel>URL</FormLabel>
          <Input
            type="string"
            placeholder="postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1]"
            {...register("credentials.url")}
          />
          <FormHelperText>The URL of your Postgres DB.</FormHelperText>
        </FormControl>

        <FormControl id="type">
          <FormLabel>Data source type</FormLabel>
          <Select {...register("type")}>
            <option disabled>Select data source</option>
            {options.map(({ id, label, enabled }) => (
              <option key={id} value={id} disabled={!enabled}>
                {label}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl id="credentials_useSsl">
          <FormLabel>Use SSL</FormLabel>
          <Checkbox {...register("credentials.useSsl")} />
        </FormControl>

        {/* <form onSubmit={handleSubmit(onSubmit)}>
        <Container className="flex flex-col space-y-2 justify-center items-center">
          <Button type="submit">Create</Button>
        </Container>
      </form> */}
        {/* <TextField
            placeholder="My Postgres DB"
            defaultValue={data?.name}
            isLoading={isLoading}
            formState={formState}
            register={register("name")}
          />
          <TextField
            placeholder="postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1]"
            defaultValue={data?.url}
            isLoading={isLoading}
            formState={formState}
            register={register("url")}
          /> */}
        {/* <SelectField
            defaultValue={data?.type}
            options={availableDataSourceTypes}
            formState={formState}
            register={register('type')}
          /> */}
        {/* <pre>{JSON.stringify(isLoading, null, 2)}</pre> */}
        <input type="submit" className="hidden invisible" />
        <Button className="mt-4" type="submit" disabled={isLoading}>
          {whenCreating ? "Create" : "Update"}
        </Button>
      </form>
    </PageWrapper>
  );
}

export default Form;
