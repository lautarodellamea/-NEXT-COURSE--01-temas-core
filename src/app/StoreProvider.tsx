'use client'

import { useEffect, useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '../lib/store'
import { setFavoritePokemons } from '@/lib/features/pokemons/pokemonsSlice'
import { initCounterState } from '@/lib/features/counter/counterSlice'

export default function StoreProvider({
  // count = 27,
  children,
}: {
  // count?: number
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore>()

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()

    // para inicializar un valor
    // ya lo inicializamos en el propio slice (counterSlice)
    // storeRef.current.dispatch(initCounterState(count))
  }

  // Inicializar favoritos desde localStorage solo en el cliente (evita "localStorage is not defined" en SSR/prerender)
  useEffect(() => {
    if (typeof window === 'undefined') return
    storeRef.current?.dispatch(setFavoritePokemons(JSON.parse(localStorage.getItem("favorite-pokemons") ?? "{}")))
  }, [])

  return <Provider store={storeRef.current}>{children}</Provider>
}


// como la app siempre pasa por aca podriamos hace inicializaciones, verificaciones, etc, ya sea desde la api o desde donde sea