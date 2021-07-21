export type LayerState = {}

const initialLayerState = {}

const LayerReducer = (
  state: LayerState = initialinitialLayerStateLocaleState,
  action: { type: string }
): any => {
  switch (action.type) {
    case 'locale/set':
      return action.locale
        ? {
            ...state,
            locale: action.locale
          }
        : { ...state }

    default:
      return state
  }
}

export { initialLayerState }
export default LayerReducer
