import { DataSourcePlugin } from './types'
import postgresql from "./postgresql";

const dataSources: DataSourcePlugin[] = [postgresql];

export default dataSources
