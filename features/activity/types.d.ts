import {
  Activity as ActivityTypePrisma,
  DataSource,
  User,
  View,
} from "@prisma/client";

export type ActivityType = ActivityTypePrisma & {
  dataSource?: DataSource;
  view?: View;
  user: User;
};
