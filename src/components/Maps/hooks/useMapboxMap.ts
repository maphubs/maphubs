import { useSelector } from '../redux/hooks'

export default function useMapboxMap(): {
  mapboxMap: mapboxgl.Map | null
} {
  const mapboxMap = useSelector((state) => state.map.mapboxMap)

  return { mapboxMap }
}
