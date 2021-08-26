import Adapters from 'next-auth/adapters'
import Models from './models'
const adapter = Adapters.TypeORM.Adapter(
  `${process.env.DB_CONNECTION}?entityPrefix=nextauth_`,
  {
    models: {
      User: Models.User
    }
  }
)
export default adapter
