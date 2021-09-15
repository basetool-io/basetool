import { useRouter } from 'next/router'
import Link from 'next/link'
import React, { useEffect } from 'react'

function UnauthenticatedView() {
  const router = useRouter()
  useEffect(() => { router.push('/auth/login') }, [])

  return (
    <div className="absolute flex items-center justify-center h-full w-full inset-0 bg-opacity-75 z-20 rounded-xl bg-white">
      Unauthenticated. Please login&nbsp;<Link href="/auth/login"><a className="underline">here</a></Link>.
    </div>
  )
}

export default UnauthenticatedView
