import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'

import locale from './reducers/localeSlice'
import group from './reducers/groupSlice'
import layer from './reducers/layerSlice'

export function makeStore() {
  return configureStore({
    reducer: { locale, group, layer }
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
