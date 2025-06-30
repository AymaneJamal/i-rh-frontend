import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./auth-slice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Exposer le store globalement pour l'API client
if (typeof window !== 'undefined') {
  (window as any).__REDUX_STORE__ = store
}