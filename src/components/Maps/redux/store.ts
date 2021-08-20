import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'

import mapMaker from './reducers/mapMakerSlice'
import map from './reducers/mapSlice'
import baseMap from './reducers/baseMapSlice'
import dataEditor from './reducers/dataEditorSlice'
import locale from './reducers/localeSlice'

export function makeStore() {
  return configureStore({
    reducer: { map, baseMap, mapMaker, dataEditor, locale }
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
