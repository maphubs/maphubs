import { useRef } from 'react'

function useStickyResult(value: any): any {
  const val = useRef<any>()
  if (value !== undefined) val.current = value
  return val.current
}

export default useStickyResult
