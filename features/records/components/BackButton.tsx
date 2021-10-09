import { BackspaceIcon } from "@heroicons/react/outline";
import { Button } from "@chakra-ui/react";
import Link from "next/link";
import React, { ReactElement, memo } from "react";

function BackButton({ href, children = 'Back' }: { href: string, children?: ReactElement | string }) {
  return (
    <Link href={href} passHref>
      <Button
        size="xs"
        as="a"
        colorScheme="blackAlpha"
        variant="ghost"
        leftIcon={<BackspaceIcon className="h-4" />}
      >
        {children}
      </Button>
    </Link>
  );
}

export default memo(BackButton);
