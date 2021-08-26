export type MapHubsField = {
  type: 'text' | 'number' | 'combo'
  tag: string
  label: LocalizedString
  isRequired: boolean
  showOnMap: boolean
  id: number
}