import GraphQLJSON from 'graphql-type-json'
// import mutations from './mutations'
import queries from './queries'
import mutations from './mutations'
const resolvers = {
  Query: queries,
  JSON: GraphQLJSON,
  Mutation: mutations
}
export default resolvers
