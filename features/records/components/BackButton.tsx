import { BackspaceIcon } from "@heroicons/react/outline";
import { Button } from "@chakra-ui/react";
import Link from "next/link";
import React, { memo } from "react";

function BackButton({ href }: { href: string }) {
  return (
    <Link href={href} passHref>
      <Button
        size="xs"
        as="a"
        colorScheme="blackAlpha"
        variant="ghost"
        leftIcon={<BackspaceIcon className="h-4" />}
      >
        Back
      </Button>
    </Link>
  );
}

export default memo(BackButton);
