import PageModel from '../../models/page'

export default {
  async pageConfig(): Promise<Record<string, unknown>> {
    return PageModel.getPageConfigs(['header', 'footer'])
  }
}
