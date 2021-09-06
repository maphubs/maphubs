import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'

import locale from './reducers/localeSlice'
import group from './reducers/groupSlice'
import layer from './reducers/layerSlice'
import story from './reducers/storySlice'

export function makeStore() {
  return configureStore({
    reducer: { locale, group, layer, story }
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
