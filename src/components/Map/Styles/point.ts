export default {
  getPointLayers(
    layer_id: number,
    shortid: string,
    color: string,
    hoverColor: string,
    interactive: boolean,
    showBehindBaseMapLabels: boolean
  ): Array<
    | {
        filter: Array<string>
        id: string
        metadata: {
          'maphubs:globalid': string
          'maphubs:interactive': boolean
          'maphubs:layer_id': number
          'maphubs:showBehindBaseMapLabels': boolean
        }
        paint: {
          'circle-color': string
          'circle-opacity': number
        }
        source: string
        'source-layer': string
        type: string
      }
    | {
        filter: Array<string>
        id: string
        metadata: {
          'maphubs:globalid': string
          'maphubs:layer_id': number
        }
        paint: {
          'circle-color': string
          'circle-opacity': number
          'circle-radius': number
        }
        source: string
        'source-layer': string
        type: string
      }
  > {
    const layers = [
      {
        id: `omh-data-point-${layer_id}-${shortid}`,
        type: 'circle',
        metadata: {
          'maphubs:layer_id': layer_id,
          'maphubs:globalid': shortid,
          'maphubs:interactive': interactive,
          'maphubs:showBehindBaseMapLabels': showBehindBaseMapLabels
        },
        source: 'omh-' + shortid,
        'source-layer': 'data',
        filter: ['in', '$type', 'Point'],
        paint: {
          'circle-color': color,
          'circle-opacity': 1
        }
      },
      {
        id: `omh-hover-point-${layer_id}-${shortid}`,
        type: 'circle',
        metadata: {
          'maphubs:layer_id': layer_id,
          'maphubs:globalid': shortid
        },
        source: 'omh-' + shortid,
        'source-layer': 'data',
        filter: ['==', 'mhid', ''],
        paint: {
          'circle-radius': 15,
          'circle-color': hoverColor,
          'circle-opacity': 0.5
        }
      }
    ]
    return layers
  }
}