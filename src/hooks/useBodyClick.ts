import React from 'react'
const useBodyClick = (fn: (e) => void): void => {
  const cb = React.useRef(fn)

  React.useEffect(() => {
    const onClick = cb.current
    document.body.addEventListener('click', onClick)
    return () => {
      document.body.removeEventListener('click', onClick)
    }
  }, [cb])
}
export default useBodyClick
