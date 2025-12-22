import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "../lib/api/apollo";
import "./globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
