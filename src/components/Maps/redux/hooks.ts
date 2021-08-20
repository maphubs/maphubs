import {
  TypedUseSelectorHook,
  useDispatch as defaultUseDispatch,
  useSelector as defaultUseSelector
} from 'react-redux'
import type { AppDispatch, AppState } from './store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useDispatch = (): AppDispatch => defaultUseDispatch<AppDispatch>()

export const useSelector: TypedUseSelectorHook<AppState> = defaultUseSelector
