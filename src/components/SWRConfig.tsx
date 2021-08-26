import React from 'react'
import { SWRConfig } from 'swr'
// import { useDispatch } from 'react-redux'
import fetcher from '../graphql/graphql-fetcher'
export default function POKSSWRConfig({
  children
}: {
  children?: JSX.Element | JSX.Element[]
}): JSX.Element {
  // const dispatch = useDispatch()
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        onError: (error) => {
          if (error.status === 401) {
            window.location.href = `/api/login`
          }

          console.log('SWR Error')
          console.log(error.message)
          /*
          dispatch({
            type: 'UPDATE_DATA_STATUS',
            status: 'error',
            error: error.message
          })
          */
        },
        onSuccess: () => {
          /*
          dispatch({
            type: 'UPDATE_DATA_STATUS',
            status: 'success'
          })
          */
        }
      }}
    >
      {children}
    </SWRConfig>
  )
}
