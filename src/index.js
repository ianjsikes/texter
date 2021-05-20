import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import 'font-awesome/css/font-awesome.css'
import registerServiceWorker from './registerServiceWorker'
console.log('APPPPP', App)

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
