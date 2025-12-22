import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { BACKEND_URL, ENV } from "../config/app-config";

// Re-export for use in other components
export { BACKEND_URL };

const httpLink = createHttpLink({
  uri: BACKEND_URL,
});

const authLink = setContext((_, { headers }) => {
  // If we're in Codespaces and have a GitHub token, add the auth header
  if (ENV.IS_CODESPACES && ENV.GITHUB_TOKEN) {
    return {
      headers: {
        ...headers,
        "X-Github-Token": ENV.GITHUB_TOKEN,
      },
    };
  }

  // Otherwise, return headers as-is
  return {
    headers,
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});
