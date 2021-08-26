const fetcher = (query: string, id: string): Promise<Record<string, any>> =>
  fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      query: query.replaceAll('{id}', id)
    })
  })
    .then(async (res) => {
      const body = await res.json()

      if (res.status === 400) {
        const error = body.errors
          ? new Error(body.errors[0].message)
          : new Error('API Request Failed')
        throw error
      }

      return body
    })
    .then((json) => json.data)

export default fetcher
