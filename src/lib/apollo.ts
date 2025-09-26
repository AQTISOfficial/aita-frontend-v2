import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { publicEnv } from "./env.public";

export const client = new ApolloClient({
    link: new HttpLink({ uri: publicEnv.NEXT_PUBLIC_AITA_SUBGRAPH }),
    cache: new InMemoryCache(),
});
