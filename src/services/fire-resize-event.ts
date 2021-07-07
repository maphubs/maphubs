export default (): void => {
  if (Event.prototype.initEvent) {
    /* deprecated method */
    const evt: any = document.createEvent('UIEvents')
    evt.initUIEvent('resize', true, false, window, 0)
    window.dispatchEvent(evt)
  } else {
    /* current method */
    window.dispatchEvent(new Event('resize'))
  }
}
