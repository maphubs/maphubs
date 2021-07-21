export default {
  getLicenses(__) {
    return [
      {
        value: 'none',
        label: __('No License Provided'),
        note: '<p>' + __('License is not known or is not provided') + '</p>'
      },
      {
        value: 'custom',
        label: __('Custom'),
        note: '<p>' + __('Custom License - see layer documentation') + '</p>'
      },
      {
        value: 'custom-nc',
        label: __('Custom- Non-Commerical'),
        note:
          '<p>' +
          __('Custom Non-Commerical License - see layer documentation') +
          '</p>'
      },
      {
        value: 'odc-by',
        label: 'Open Data Commons Attribution License',
        note: '<a target="_blank" rel="noopener noreferrer" href="http://opendatacommons.org/licenses/by/">http://opendatacommons.org/licenses/by/</a>'
      },
      {
        value: 'odc-odbl',
        label: 'ODC Open Database License',
        note: '<a target="_blank" rel="noopener noreferrer" href="http://opendatacommons.org/licenses/odbl/">http://opendatacommons.org/licenses/odbl/</a>'
      },
      {
        value: 'odc-pddl',
        label: 'ODC Public Domain Dedication and License',
        note: '<a target="_blank" rel="noopener noreferrer" href="http://opendatacommons.org/licenses/pddl/">http://opendatacommons.org/licenses/pddl/</a>'
      },
      {
        value: 'cc-pd',
        label: 'Creative Commons Public Domain (CC PD)',
        note: '<a target="_blank" rel="noopener noreferrer" href="https://wiki.creativecommons.org/wiki/Public_domain"><img src="https://cdn-maphubs.b-cdn.net/maphubs/assets/licenses/publicdomain.png" width="100" height="35"/><br />https://wiki.creativecommons.org/wiki/Public_domain</a>'
      },
      {
        value: 'cc-cc0',
        label: 'Creative Commons Zero - No Copyright Reserved (CC0)',
        note: '<a target="_blank" rel="noopener noreferrer" href="https://wiki.creativecommons.org/wiki/CC0"><img src="https://cdn-maphubs.b-cdn.net/maphubs/assets/licenses/cc-zero.png" width="100" height="35"/><br />https://wiki.creativecommons.org/wiki/CC0</a>'
      },
      {
        value: 'cc-by',
        label: 'Creative Commons Attribution (CC BY)',
        note: '<a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by/4.0/"><img src="https://cdn-maphubs.b-cdn.net/maphubs/assets/licenses/by.png" width="100" height="35"/><br />https://creativecommons.org/licenses/by/4.0/</a>'
      },
      {
        value: 'cc-by-sa',
        label: 'Creative Commons Attribution-ShareAlike (CC BY-SA)',
        note: '<a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-sa/4.0"><img src="https://cdn-maphubs.b-cdn.net/maphubs/assets/licenses/by-sa.png" width="100" height="35"/><br />https://creativecommons.org/licenses/by-sa/4.0</a>'
      },
      {
        value: 'cc-by-nd',
        label: 'Creative Commons Attribution-NoDerivs (CC BY-ND)',
        note: '<a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-nd/4.0/"><img src="https://cdn-maphubs.b-cdn.net/maphubs/assets/licenses/by-nd.png" width="100" height="35"/><br />https://creativecommons.org/licenses/by-nd/4.0/</a>'
      },
      {
        value: 'cc-by-nc',
        label: 'Creative Commons Attribution-NonCommercial (CC BY-NC)',
        note: '<a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-nc/4.0/"><img src="https://cdn-maphubs.b-cdn.net/maphubs/assets/licenses/by-nc.png" width="100" height="35"/><br />https://creativecommons.org/licenses/by-nc/4.0/</a>'
      },
      {
        value: 'cc-by-nc-sa',
        label:
          'Creative Commons Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)',
        note: '<a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-nc-sa/4.0/"><img src="https://cdn-maphubs.b-cdn.net/maphubs/assets/licenses/by-nc-sa.png" width="100" height="35"/><br />https://creativecommons.org/licenses/by-nc-sa/4.0/</a>'
      },
      {
        value: 'cc-by-nc-nd',
        label:
          'Creative Commons Attribution-NonCommercial-NoDerivs (CC BY-NC-ND)',
        note: '<a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-nc-nd/4.0/"><img src="https://cdn-maphubs.b-cdn.net/maphubs/assets/licenses/by-nc-nd.png" width="100" height="35"/><br />https://creativecommons.org/licenses/by-nc-nd/4.0/</a>'
      }
    ]
  }
}
