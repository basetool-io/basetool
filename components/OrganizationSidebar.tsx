import { ClipboardListIcon, ShieldCheckIcon, UserGroupIcon } from "@heroicons/react/outline";
import { Organization } from "@prisma/client"
import { useRouter } from "next/router"
import Link from "next/link"
import React, { ReactNode, memo, useMemo } from "react";
import Shimmer from "./Shimmer"
import classNames from "classnames"

const Item = ({
  label,
  link,
  icon,
  description,
}: {
  label: string;
  link: string;
  icon: ReactNode;
  description: string;
}) => {
  const router = useRouter()
  const isActive = useMemo(() => router.asPath.includes(link), [router.asPath, link])

  return (
    <Link href={link}>
      <a className={classNames("w-full px-2 py-1 flex flex-col hover:no-underline text-cool-gray-900 rounded", {
        'text-blue-900 bg-white shadow': isActive
      })}>
        <div className="flex items-center space-x-2">
          {icon} <span>{label}</span>
        </div>
        {description && <div className="text-xs">{description}</div>}
      </a>
    </Link>
  );
};

function OrganizationSidebar({organization}: {organization?: Organization}) {
  return (
    <div className="relative space-y-x w-full h-full overflow-auto flex flex-col overflow-y-auto">
      <div className="px-4 py-4 font-bold uppercase text-sm leading-none h-[40px]">
        {!organization?.name && <Shimmer />}
        {organization?.name}
      </div>
      <div className="p-2 space-y-2 pr-0">
        {/* <Item
          label="General"
          link={`/organizations/${organization?.slug}`}
          icon={<InformationCircleIcon className="h-4" />}
          description="Get to know your organization"
        /> */}
        <Item
          label="Members"
          link={organization?.slug ? `/organizations/${organization?.slug}/members` : ''}
          icon={<UserGroupIcon className="h-4" />}
          description="The more the merrier"
        />
        <Item
          label="Roles"
          link={organization?.slug ? `/organizations/${organization?.slug}/roles` : ''}
          icon={<ShieldCheckIcon className="h-4" />}
          description="You might allow some members to do some things and others not"
        />
        <Item
          label="Activity"
          link={organization?.slug ? `/organizations/${organization?.slug}/activity` : ''}
          icon={<ClipboardListIcon className="h-4" />}
          description="See all record updates"
        />
      </div>
    </div>
  );
}

export default memo(OrganizationSidebar);
