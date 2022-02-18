import { ApolloServer, gql } from "apollo-server";
import { DATATYPE } from "./lib/Datatype";
import { RESOLVER } from "./resolver";
import { loadSchema } from "./resolver/SchemaLoader";

const contextType = () => {
  return {
    url: DATATYPE.URL,
    upload: DATATYPE.UPLOAD,
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
