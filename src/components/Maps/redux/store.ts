import {
  configureStore,
  ThunkAction,
  Action,
  EnhancedStore
} from '@reduxjs/toolkit'

import mapMaker from './reducers/mapMakerSlice'
import map from './reducers/mapSlice'
import baseMap from './reducers/baseMapSlice'

export function makeStore(): EnhancedStore {
  return configureStore({
    reducer: { map, baseMap, mapMaker }
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
