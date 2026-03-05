import { Middleware, configureStore } from "@reduxjs/toolkit";
import counterReducer from "./features/counter/counterSlice";
import pokemonsReducer from "./features/pokemons/pokemonsSlice";
import { localStorageMiddleware } from "./middlewares/localstorage-middleware";

export const makeStore = () => {
  return configureStore({
    reducer: {
      counter: counterReducer,
      pokemons: pokemonsReducer,
    },

    // lo comento ya que lo estamos haciendo de otra manera usando el localStorage en redux (no recomendado)
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(localStorageMiddleware as Middleware), // mediante el middleware podremos usar localStorage al interceptar ciertas acciones (forma recomendada)
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
