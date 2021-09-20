import { UserGroupIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router"
import Link from "next/link"
import React, { ReactNode, memo, useMemo } from "react";
import classNames from "classnames"

const SettingsItem = ({
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
  const isActive = useMemo(() => link === router.pathname, [router.pathname])

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

function SettingsSidebar() {
  return (
    <div className="relative space-y-x w-full h-full overflow-auto flex flex-col">
      <div className="px-4 py-4 font-bold uppercase text-sm leading-none h-[40px]">
        Settings
      </div>
      <div className="p-2 space-y-2 pr-0">
        <SettingsItem
          label="Roles"
          link="/settings/roles"
          icon={<UserGroupIcon className="h-4" />}
          description="You might allow some members to do something and some not."
        />
      </div>
    </div>
  );
}

export default memo(SettingsSidebar);
