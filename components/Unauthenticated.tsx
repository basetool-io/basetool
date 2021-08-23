import { useRouter } from 'next/router'
import Link from 'next/link'
import React, { useEffect } from 'react'

function Unauthenticated() {
  const router = useRouter()
  useEffect(() => { router.push('/auth/login') }, [])

  return (
    <div>
      Unauthenticated. Please login <Link href="/auth/login">here</Link>
    </div>
  )
}

export default Unauthenticated
