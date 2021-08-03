import User from '../../models/user'
import { apiError, apiDataError } from '../../services/error-response'

export default function (app: any): void {
  app.get('/api/user/search/suggestions', (req, res) => {
    if (!req.query.q) {
      apiDataError(res)
      return
    }

    const q = req.query.q
    User.getSearchSuggestions(q)
      .then((result) => {
        const suggestions = []
        for (const user of result) {
          suggestions.push({
            key: user.id,
            value: user.display_name
          })
        }
        return res.send({
          suggestions
        })
      })
      .catch(apiError(res, 500))
  })
}
