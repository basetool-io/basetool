import { ButtonGroup } from "@chakra-ui/react";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React from "react";

function New() {
  return (
    <Layout>
      <PageWrapper
        heading={"Create action"}
        flush={true}
        buttons={<ButtonGroup size="xs"></ButtonGroup>}
        // footer={
        //   // hasIdColumn && (
        //   //   <PageWrapper.Footer
        //   //     // left={canBulkDelete && <BulkDeleteButton />}
        //   //     // center={canCreate && <CreateButton />}
        //   //   />
        //   // )
        // }
      >
      <div className="relative flex flex-col flex-1 w-full h-full">
        <div className="relative flex justify-end w-full py-2 px-2 bg-white shadow z-60 rounded">
          </div>
          </div>
      </PageWrapper>
    </Layout>
  );
}

export default New;
