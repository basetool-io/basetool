import { Switch } from '@headlessui/react'
import { classNames } from '@/src/utils/classNames'
import { removeDataQuery } from '@/features/app-state/data-queries-slice'
import { useApi } from '@/src/hooks'
import { useAppDispatch } from '@/src/hooks/state'
import Button from '@/components/Button'
import DataQuery from '@/types/app-state/DataQuery'
import React from 'react'

function DataQueryEditor({
  dataQuery,
  setDataQuery,
}: {
  dataQuery: DataQuery | undefined;
  setDataQuery: ({ name, dataQuery }: { name: string, dataQuery: DataQuery }) => void;
}) {
  const api = useApi()
  const dispatch = useAppDispatch()

  const toggleRunOnPageLoad = () => {
    if (dataQuery) {
      const newDataQuery = {
        ...dataQuery,
        options: {
          ...dataQuery?.options,
          runOnPageLoad: !dataQuery?.options.runOnPageLoad,
        },
      }
      setDataQuery({ name: dataQuery.name, dataQuery: newDataQuery })
    }
  }

  const updateQueryString = (value: string) => {
    if (dataQuery) {
      const newDataQuery = {
        ...dataQuery,
        options: {
          ...dataQuery?.options,
          query: value,
        },
      }
      setDataQuery({ name: dataQuery.name, dataQuery: newDataQuery })
    }
  }

  const deleteDataQuery = async () => {
    if (dataQuery) {
      const response = await api.deleteDataQuery(dataQuery.id)
      if (response.ok) {
        dispatch(removeDataQuery(dataQuery.id))
      }
    }
  }

  return (
    <>
      {!dataQuery && 'Please select a query from the left'}
      {dataQuery && (
        <div className="flex flex-1 flex-col space-y-2">
          <div className="relative z-10">
            <Switch.Group as="div" className="flex items-center">
              <Switch
                checked={dataQuery.options.runOnPageLoad}
                onChange={toggleRunOnPageLoad}
                className={classNames(
                  dataQuery.options.runOnPageLoad
                    ? 'bg-indigo-600'
                    : 'bg-gray-200',
                  'relative inline-flex flex-shrink-0 h-5 w-9 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                )}
              >
                <span
                  aria-hidden="true"
                  className={classNames(
                    dataQuery.options.runOnPageLoad
                      ? 'translate-x-4'
                      : 'translate-x-0',
                    'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                  )}
                />
              </Switch>
              <Switch.Label as="span" className="ml-3">
                <span className="text-sm font-medium text-gray-900 cursor-pointer select-none">
                  Run on page load
                </span>
              </Switch.Label>
            </Switch.Group>
          </div>
          <div>
            <textarea
              name="query"
              id="query"
              rows={2}
              value={dataQuery?.options?.query || ''}
              onChange={(e) => updateQueryString(e.target.value)}
              className="border"
              placeholder="SELECT * FROM users"
            />
          </div>
          <div>
            <Button onClick={deleteDataQuery}>Delete</Button>
          </div>
        </div>
      )}
    </>
  )
}

export default DataQueryEditor
