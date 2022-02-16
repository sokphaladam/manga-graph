import { ApolloServer, gql } from "apollo-server";
import { ContextType } from "./lib/ContextType";
import { DATATYPE } from "./lib/Datatype";
import { RESOLVER } from "./resolver";
import { loadSchema } from "./resolver/SchemaLoader";

function contextType(): ContextType {
  return {
    url: DATATYPE.URL,
  };
}

const server = new ApolloServer({
  typeDefs: loadSchema,
  resolvers: RESOLVER,
  context: contextType,
});

server.listen(8080).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
