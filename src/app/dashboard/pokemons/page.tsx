import { PokemonGrid, PokemonsResponse, SimplePokemon } from "@/pokemons";
import { getServerSideProps } from "next/dist/build/templates/pages";
import { notFound } from "next/navigation";

// export const revalidate = 60
// Si usamos axios, un ORM o cualquier método distinto a fetch,
// debemos definir el revalidate a nivel del segmento (page/layout).
// El valor debe ser un número estático (no una expresión dinámica),
// ya que Next lo analiza en build time.

export const metadata = {
  title: "151 Pokémons",
  description: "Ad minim sit cupidatat culpa consectetur.",
};

const getPokemons = async (
  limit = 20,
  offset = 0,
): Promise<SimplePokemon[]> => {
  // Si esta misma request se ejecuta múltiples veces durante el mismo render,
  // Next.js la deduplica automáticamente (request memoization).
  // Además, por defecto el comportamiento es 'force-cache' en Server Components,
  // lo que permite que la respuesta se almacene en el Data Cache.
  const data: PokemonsResponse = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,

    // Opciones de cache:

    // { cache: 'force-cache' }
    // → (default) Usa el Data Cache. Ideal para contenido estático o poco cambiante.

    // { cache: 'no-store' }
    // → Fuerza rendering dinámico. Hace la petición en cada request del usuario.

    // { next: { revalidate: 60 } }
    // → Implementa ISR (Incremental Static Regeneration).
    //    Guarda la respuesta en cache y la revalida cada X segundos.

    // ⚠ No combinar 'no-store' con 'revalidate',
    // ya que uno fuerza modo dinámico y el otro cache con expiración.
  ).then((res) => res.json());

  // cuardamos los pokemones como nosotros queremos extrayendolos de la respuesta
  const pokemons = data.results.map((pokemon) => ({
    id: pokemon.url.split("/").at(-2)!,
    name: pokemon.name,
  }));

  // cuando tengamos un error nos lleva al error.tsx
  // throw new Error('Esto es un error que no debería de suceder');

  // para llevarlo a la pagina not-found.tsx
  // throw notFound();

  return pokemons;
};

export default async function PokemonsPage() {
  const pokemons = await getPokemons(151);

  return (
    <div className="flex flex-col">
      <span className="text-5xl my-2">
        Listado de Pokémons <small className="text-blue-500">estático</small>
      </span>

      <PokemonGrid pokemons={pokemons} />
    </div>
  );
}
