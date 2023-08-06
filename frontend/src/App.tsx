
import { mainRouter } from './router/mainRouter'
import { Provider } from 'react-redux'
import { store } from './global/store'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PersistGate } from 'redux-persist/integration/react'
import {
  persistStore,
} from 'redux-persist'
import { RouterProvider } from "react-router-dom"

let persistor = persistStore(store)

let client = new QueryClient()

const App = () => {
  return (
    <div>
      < Provider store={store} >
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={client} >
            <RouterProvider router={mainRouter} />
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </div>
  )
}

export default App