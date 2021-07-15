// handles custom pages, anything that is not a page in the default site
// if the path is not found in the custom list, redirect to the 404 page

import React from 'react'

const CustomPage = () => {
  // get the custom page config
  // if found, build the page components
  // if not found, redirect to the 404 page
  return (
    <div>
      <h1>Custom Page</h1>
    </div>
  )
}
