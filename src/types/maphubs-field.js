import {Record} from "immutable";

export type MapHubsField = {
  type: 'text' | 'number' | 'combo',
  tag: string,
  label: LocalizedString,
  isRequired: boolean,
  showOnMap: boolean,
  id: number
}

//export type MapHubsFieldImm = Record<MapHubsField>