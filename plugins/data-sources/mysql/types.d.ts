export type MysqlCredentials = {
  host: string;
  port: number;
  database: string;
  user: string;
  password?: string;
  useSsl: boolean;
};
