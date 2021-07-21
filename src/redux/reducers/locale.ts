export type LocaleState = {
  locale?: string
}

const initialLocaleState = {
  locale: 'en'
}

const locale = (
  state: LocaleState = initialLocaleState,
  action: { type: string; locale: string }
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

export { initialLocaleState }
export default locale
