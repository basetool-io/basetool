import 'next-auth'

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `Provider` React Context
   */
  interface Session {
    user: {
      id: number
      email: string
      firstName: string
      lastName: string
      image: string
      name: string
      createdAt: number
      intercomUserHash
    }
  }
}
