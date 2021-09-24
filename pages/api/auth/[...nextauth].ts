import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { User } from "next-auth";
import Providers from "next-auth/providers";
import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "@/prisma";

function createIntercomUserHash(user: User | undefined): string | undefined {
  if (!user?.email) return;

  const secret = process.env.INTERCOM_SECRET as string;
  const hmac = crypto.createHmac("sha256", secret);

  // passing the data to be hashed
  // We'll use an email & createdAt combination so we update the user if he gets invited to a second org.
  const data = hmac.update(`${user.email}-${user.createdAt}`);

  // Creating the hmac in the required format
  return data.digest("hex");
}

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default NextAuth({
  adapter: PrismaAdapter(prisma),

  // https://next-auth.js.org/configuration/providers
  providers: [
    // Providers.Email({
    //   server: process.env.EMAIL_SERVER,
    //   from: process.env.EMAIL_FROM,
    // }),
    Providers.Credentials({
      name: "Credentials",
      async authorize(credentials: {
        email: string;
        username: string;
        password: string;
      }) {
        const user = await prisma.user.findUnique({
          where: {
            email: credentials?.email,
          },
        });

        if (!user) return null;

        const passwordIsValid = bcrypt.compareSync(
          credentials.password,
          user?.password as string
        );

        if (passwordIsValid) {
          return user;
        }

        return null;
      },
      credentials: {
        // domain: {
        //   label: 'Domain', type: 'text ', placeholder: 'www.acme.inc',
        // },
        username: {
          label: "Email",
          type: "email",
          placeholder: "john@doe.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "secret123",
        },
      },
    }),
  ],
  // Database optional. MySQL, Maria DB, Postgres and MongoDB are supported.
  // https://next-auth.js.org/configuration/databases
  //
  // Notes:
  // * You must install an appropriate node_module for your database
  // * The Email provider requires a database (OAuth providers do not)
  database: process.env.DATABASE_URL,

  // The secret should be set to a reasonably long random string.
  // It is used to sign cookies and to sign and encrypt JSON Web Tokens, unless
  // a separate secret is defined explicitly for encrypting the JWT.
  secret: process.env.SECRET,

  session: {
    // Use JSON Web Tokens for session instead of database sessions.
    // This option can be used with or without a database for users/accounts.
    // Note: `jwt` is automatically set to `true` if no database is specified.
    jwt: true,

    // Seconds - How long until an idle session expires and is no longer valid.
    // maxAge: 30 * 24 * 60 * 60, // 30 days

    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    // updateAge: 24 * 60 * 60, // 24 hours
  },

  // JSON Web tokens are only used for sessions if the `jwt: true` session
  // option is set - or by default if no database is specified.
  // https://next-auth.js.org/configuration/options#jwt
  jwt: {
    // A secret to use for key generation (you should set this explicitly)
    secret: process.env.SECRET,
    // Set to true to use encryption (default: false)
    // encryption: true,
    // You can define your own encode/decode functions for signing and encryption
    // if you want to override the default behaviour.
    // encode: async ({ secret, token, maxAge }) => {},
    // decode: async ({ secret, token, maxAge }) => {},
    // signingKey: process.env.JWT_SIGNING_PRIVATE_KEY,
  },

  // You can define custom pages to override the built-in ones. These will be regular Next.js pages
  // so ensure that they are placed outside of the '/api' folder, e.g. signIn: '/auth/mycustom-signin'
  // The routes shown here are the default URLs that will be used when a custom
  // pages is not specified for that route.
  // https://next-auth.js.org/configuration/pages
  pages: {
    signIn: "/auth/login", // Displays signin buttons
    // signOut: '/auth/signout', // Displays form with sign out button
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // Used for check email page
    // newUser: null // If set, new users will be directed here on first sign in
  },

  // Callbacks are asynchronous functions you can use to control what happens
  // when an action is performed.
  // https://next-auth.js.org/configuration/callbacks
  callbacks: {
    // async signIn(user, account, profile) {},
    async redirect(url, baseUrl) {
      return baseUrl;
    },
    async session(session, token: { user?: Record<string, unknown> }) {
      session.user = {
        ...session.user,
        ...token.user,
      };

      return session;
    },
    async jwt(token, user, account, profile, isNewUser) {
      if (user) {
        token.user = {
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`,
          createdAt: (user.createdAt as Date).getTime(),
          intercomUserHash: createIntercomUserHash(user),
        };
      }

      return token;
    },
  },

  // Events are useful for logging
  // https://next-auth.js.org/configuration/events
  events: {
    async signIn({ user }: { user: User }) {
      if (user?.email) {
        await prisma.user.updateMany({
          where: {
            email: user.email,
          },
          data: {
            lastLoggedInAt: new Date(),
          },
        });
      }
    },
  },

  // You can set the theme to 'light', 'dark' or use 'auto' to default to the
  // whatever prefers-color-scheme is set to in the browser. Default is 'auto'
  // theme: 'auto',

  // Enable debug messages in the console if you are having problems
  debug: true,
});
