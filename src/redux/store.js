import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import { createBrowserHistory } from 'history'
import { routerReducer, routerMiddleware } from 'react-router-redux'

import * as reducers from './reducers'
import { rootEpic } from './epics'

export const setupStore = () => {
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

  const epicMiddleware = createEpicMiddleware(rootEpic)

  const history = createBrowserHistory()
  const middleware = routerMiddleware(history)

  const store = createStore(
    combineReducers({
      ...reducers,
      router: routerReducer,
    }),
    composeEnhancers(applyMiddleware(epicMiddleware, middleware)),
  )

  return {
    store,
    history,
  }
}
