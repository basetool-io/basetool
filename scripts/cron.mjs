#!/usr/bin/env zx

const baseUrl = 'https://app.basetool.io'
const dataSourceId = 1
const organizationId = 1
const tableName = 'users'
const recordId = 1
const roleId = 1
const paths = [
  `/api/profile`,
  `/api/auth/session`,
  `/api/auth/register`,
  `/api/data-sources`,
  `/api/data-sources/${dataSourceId}`,
  `/api/data-sources/${dataSourceId}/tables`,
  `/api/data-sources/${dataSourceId}/tables/${tableName}`,
  `/api/data-sources/${dataSourceId}/tables/${tableName}/columns`,
  `/api/data-sources/${dataSourceId}/tables/${tableName}/records`,
  `/api/data-sources/${dataSourceId}/tables/${tableName}/records/${recordId}`,
  `/api/data-sources/${dataSourceId}/tables/${tableName}/records/bulk`,
  `/api/organizations`,
  `/api/organizations/${organizationId}`,
  `/api/organizations/${organizationId}/invitations`,
  `/api/organizations/${organizationId}/roles`,
  `/api/organizations/${organizationId}/roles/${roleId}`,
]

// Go through each path and do a GET req with `keep_alive` param
paths.forEach((path) => {
  $`curl -X GET -H 'Content-type: application/json' --data '{}' ${baseUrl}${path}?keep_alive=yeah`
})
