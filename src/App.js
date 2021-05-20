import React, { Component } from 'react'
import { Provider } from 'react-redux'
import theme from '@rebass/preset'
import { injectGlobal, ThemeProvider } from 'styled-components'

import { AppService } from './services/app-service'
import Router from './router'

injectGlobal`
  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body { margin: 0; }
`

export const service = new AppService()
export default class App extends Component {
  constructor(props) {
    super(props)

    service.store.dispatch({ type: 'INIT' })

    setInterval(() => {
      service.store.dispatch({ type: 'INIT' })
    }, 10000)
  }

  render() {
    return (
      <Provider store={service.store}>
        <ThemeProvider theme={theme}>
          <Router />
        </ThemeProvider>
      </Provider>
    )
  }
}
