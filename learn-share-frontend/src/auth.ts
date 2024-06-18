import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
// Your own logic for dealing with plaintext password strings; be careful!
import GoogleProvider from "next-auth/providers/google";

import axios from "axios";


const endpoint = "http://localhost:4000/graphql";
const headers = {
  "content-type": "application/json",
  Authorization: "<token>",
};

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      id: string;
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"];
  }
}

async function fetchUserByEmail(email: string, graphqlQuery: string) {
  try {
    const response = await axios({
      url: endpoint,
      method: "post",
      headers: headers,
      data: graphqlQuery,
    });
    const userId = response.data.data.userByEmail.id;
    console.log(response.data.data);
    return userId;
  } catch (error) {
    console.error(error);
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.SECRET,
  trustHost: true,

  callbacks: {
    // redirect to dashboard on successful signin

    async signIn({ user, account }: { user: any; account: any }) {
      if (account && user) {
        if (account.provider === "google" || account.provider === "github") {
            return true;
        }
      }
      return false;
    },
  },
});
