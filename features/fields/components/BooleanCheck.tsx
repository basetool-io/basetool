import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/outline'
import React, { memo, useMemo } from 'react'

function BooleanCheck({ checked } : {checked: boolean}) {
  const classes = useMemo(() => `h-5 ${checked ? 'text-green-600' : 'text-red-600'}`, [checked])

  return (
    <>
      {checked && <CheckCircleIcon className={classes} />}
      {!checked && <XCircleIcon className={classes} />}
    </>
  )
}

export default memo(BooleanCheck)
