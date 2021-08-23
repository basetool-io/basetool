import {
  FormControl, FormLabel, Input, Select, Switch,
} from '@chakra-ui/react'
import { HttpDataQuery } from './types'

import KeyValue from '@/components/KeyValueEditor'
import React, { memo, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), {
  ssr: false,
})

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const DataQueryEditor = ({
  dataQuery,
  setDataQuery,
}: {
  dataQuery: HttpDataQuery;
  setDataQuery: (dataQuery: HttpDataQuery) => void;
}) => {
  const updateOption = useCallback((
    option: keyof HttpDataQuery['options'],
    value: string | boolean | object,
  ) => {
    if (dataQuery) {
      const newDataQuery = {
        ...dataQuery,
        options: {
          ...dataQuery.options,
          [option]: value,
        },
      }
      setDataQuery(newDataQuery)
    }
  }, [dataQuery])

  const hasBodyParams = useMemo(
    () => ['PUT', 'POST', 'PATCH', 'DELETE'].includes(
        dataQuery.options?.method as string,
    ),
    [dataQuery],
  )

  const updateHeaders = useCallback((value) => {
    updateOption('headers', value)
  }, [dataQuery])

  return (
    <>
      {!dataQuery && 'Please select a query from the left'}
      {dataQuery && (
        <>
          <div className="relative flex flex-col space-y-2">
            <div className="relative z-10">
              <FormControl display="flex" alignItems="center">
                <Switch
                  size="sm"
                  id={`runOnPageLoad-${dataQuery.name}`}
                  isChecked={dataQuery?.options.runOnPageLoad}
                  onChange={() => updateOption(
                    'runOnPageLoad',
                    !dataQuery?.options.runOnPageLoad,
                  )
                  }
                />{' '}
                <FormLabel
                  htmlFor={`runOnPageLoad-${dataQuery.name}`}
                  ml={2}
                  mb={0}
                >
                  Run on page load
                </FormLabel>
              </FormControl>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <div className="w-28">
                  <FormControl id="method">
                    <FormLabel>Method</FormLabel>
                    <Select
                      id="method"
                      size="sm"
                      value={dataQuery.options.method || 'GET'}
                      onChange={(e) => updateOption('method', e.currentTarget.value)
                      }
                    >
                      {METHODS.map((item, index) => (
                        <option value={item} key={index}>
                          {item}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="flex-1">
                  <FormControl id="url">
                    <FormLabel>URL</FormLabel>
                    <Input
                      size="sm"
                      placeholder="value"
                      value={dataQuery.options.url}
                      onChange={(e) => updateOption('url', e.currentTarget.value)}
                    />
                    {/* <CodeEditor
                      id="editor-url"
                      value={dataQuery.options.url}
                      onChange={(value) => updateOption('url', value, dataQuery)}
                    /> */}
                  </FormControl>
                </div>
              </div>

              {/* <FormControl id="urlParams">
                <FormLabel>URL params</FormLabel>
                <KeyValue
                  id="urlParams"
                  addLabel="Add URL param"
                  name={dataQuery.name}
                  value={dataQuery?.options?.urlParams || []}
                  onChange={(value) => updateOption('urlParams', value)}
                  />
              </FormControl> */}

              <FormControl id="headers">
                <FormLabel>Headers</FormLabel>
                <KeyValue
                  id="headers"
                  addLabel="Add header"
                  name={dataQuery.name}
                  value={dataQuery?.options?.headers || []}
                  // onChange={(value) => {
                  //   console.log('headers: value->', value)
                  //   updateOption('headers', value)
                  // }}
                  onChange={updateHeaders}
                />
              </FormControl>

              {hasBodyParams && (
                <>
                  <FormControl id="body">
                    <FormLabel>Body</FormLabel>
                    <KeyValue
                      id="body"
                      addLabel="Add body param"
                      name={dataQuery.name}
                      value={dataQuery?.options?.body || []}
                      onChange={(value) => updateOption('body', value)}
                    />
                  </FormControl>
                </>
              )}

              <FormControl id="cookies">
                <FormLabel>Cookies</FormLabel>
                <KeyValue
                  id="cookies"
                  addLabel="Add cookie"
                  name={dataQuery.name}
                  value={dataQuery?.options?.cookies || []}
                  onChange={(value) => updateOption('cookies', value)}
                />
              </FormControl>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default memo(DataQueryEditor)
