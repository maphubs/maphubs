import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'

import mapMaker from './reducers/mapMakerSlice'
import map from './reducers/mapSlice'
import baseMap from './reducers/baseMapSlice'
import dataEditor from './reducers/dataEditorSlice'
import locale from './reducers/localeSlice'

export function makeStore() {
  return configureStore({
    reducer: { map, baseMap, mapMaker, dataEditor, locale },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types
          ignoredActions: ['map/setMap', 'map/initMap'],
          // Ignore these field paths in all actions
          //ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
          // Ignore these paths in the state
          ignoredPaths: ['map.mapboxMap']
        }
      }),
    devTools: {
      actionSanitizer: (action) => {
        if (action.type === 'map/initMap' || action.type === 'map/setMap') {
          return {
            ...action,
            payload: { ...action.payload, mapboxMap: '<<MAPBOX GL>>' },
            mapboxMap: '<<MAPBOX GL>>'
          }
        }
        return action
      },
      stateSanitizer: (state) => {
        const sanitizedState = {}
        if (state.map) {
          const mapSanitized = {
            ...state.map,
            mapboxMap: '<<MAPBOX GL>>'
          }
          sanitizedState.map = mapSanitized
        }

        return { ...state, ...sanitizedState }
      }
    }
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
