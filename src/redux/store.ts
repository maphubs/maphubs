import {
  configureStore,
  ThunkAction,
  Action,
  EnhancedStore
} from '@reduxjs/toolkit'

import locale from './reducers/localeSlice'

export function makeStore(): EnhancedStore {
  return configureStore({
    reducer: { locale }
  })
}

const store = makeStore()

export type AppState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>

export default store
