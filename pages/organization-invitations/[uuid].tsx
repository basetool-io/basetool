import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { joiResolver } from "@hookform/resolvers/joi";
import { schema } from "@/features/organizations/invitationsSchema";
import { useAcceptInvitationMutation } from "@/features/organizations/api-slice";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import PageWrapper from "@/components/PageWrapper";
import PublicLayout from "@/components/PublicLayout";
import React, { useState } from "react";
import prisma from "@/prisma";

function Uuid({ invitation }: { invitation: any }) {
  const router = useRouter();
  const [organization, setOrganization] = useState(
    invitation?.organizationUser?.organization
  );

  const { register, handleSubmit, formState, setValue, getValues, watch } =
    useForm({
      defaultValues: invitation?.organizationUser?.user,
      resolver: joiResolver(schema),
    });
  const { errors, isDirty } = formState;

  const [acceptInvitation, { isLoading }] = useAcceptInvitationMutation();

  const onSubmit = async (formData: any) => {
    const response = await acceptInvitation({
      organizationId: organization.id.toString(),
      body: {
        uuid: invitation.uuid,
        formData,
      },
    }).unwrap();

    if (response?.ok) {
      await router.push(`/organizations/${organization.slug}`);
    }
  };

  return (
    <PublicLayout>
      <PageWrapper
        heading={`You have been invited to join ${organization?.name}`}
      >
        <div className="flex justify-center">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 w-full md:w-3/5 xl:w-3/5"
          >
            <FormControl id="email" isInvalid={errors?.email && isDirty}>
              <FormLabel>Email address</FormLabel>
              <Input type="email" disabled {...register("email")} />
              <FormHelperText>We'll never share your email.</FormHelperText>
              <FormErrorMessage>{errors?.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl
              id="firstName"
              isInvalid={errors?.firstName && isDirty}
            >
              <FormLabel>First name</FormLabel>
              <Input
                type="text"
                required
                placeholder="Ted"
                {...register("firstName")}
              />
              <FormHelperText>How are your friends calling you?</FormHelperText>
              <FormErrorMessage>{errors?.firstName?.message}</FormErrorMessage>
            </FormControl>

            <FormControl id="lastName" isInvalid={errors?.lastName && isDirty}>
              <FormLabel>Last name</FormLabel>
              <Input
                type="text"
                placeholder="Lasso"
                required
                {...register("lastName")}
              />
              <FormHelperText>Family name.</FormHelperText>
              <FormErrorMessage>{errors?.lastName?.message}</FormErrorMessage>
            </FormControl>

            <FormControl id="password" isInvalid={errors?.password && isDirty}>
              <FormLabel>Pasword</FormLabel>
              <Input
                type="password"
                placeholder="your strong password"
                required
                {...register("password")}
              />
              <FormHelperText>Letters and numbers.</FormHelperText>
              <FormErrorMessage>{errors?.password?.message}</FormErrorMessage>
            </FormControl>

            <FormControl
              id="passwordConfirmation"
              isInvalid={errors?.passwordConfirmation && isDirty}
            >
              <FormLabel>Pasword confirmation</FormLabel>
              <Input
                type="password"
                placeholder="confirm the password"
                required
                {...register("passwordConfirmation")}
              />
              <FormHelperText>Letters and numbers.</FormHelperText>
              <FormErrorMessage>
                {errors?.passwordConfirmation?.message}
              </FormErrorMessage>
            </FormControl>

            <Button type="submit" colorScheme="blue">
              🚀 Join
            </Button>
          </form>
        </div>
      </PageWrapper>
    </PublicLayout>
  );
}

export const getServerSideProps = async (context: any) => {
  const uuid = context?.params?.uuid as string;
  let invitation;

  if (uuid) {
    try {
      // wrapping the fin in a try/catch because prisma does some kind of uuid check and will crash if an invalid uuid passed.
      invitation = await prisma.organizationInvitation.findUnique({
        where: {
          uuid,
        },
        select: {
          uuid: true,
          organizationUser: {
            select: {
              organization: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {}
  }
  if (!uuid || !invitation) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  return {
    props: {
      invitation,
    },
  };
};

export default Uuid;
