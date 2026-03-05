import { Pokemon } from "@/pokemons";
import { Metadata } from "next";
import { cacheTag } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";

/*
  dynamicParams
  -------------

  Controla si Next.js permite servir rutas dinámicas que NO estén
  incluidas en generateStaticParams().

  - dynamicParams = true (default):
    Si el usuario entra a una ruta no pre-generada, Next puede intentar
    renderizarla "on-demand" en runtime (según config/caché).

  - dynamicParams = false:
    Solo existirán las rutas devueltas por generateStaticParams().
    Cualquier otra ruta dinámica devuelve 404 inmediatamente.

  En este ejemplo:
  generateStaticParams() genera /pokemon/1..151
  Entonces:
  - /pokemon/25  -> existe
  - /pokemon/152 -> 404 (si dynamicParams = false)
*/
// export const dynamicParams = false;

/*
  En Next.js (App Router), los parámetros de rutas dinámicas pueden
  recibirse como Promise cuando el componente es async.

  Ruta:
  /pokemon/[id]

  Si el usuario entra a:
  /pokemon/25

  params = { id: "25" }
*/
interface Props {
  params: Promise<{
    id: string;
  }>;
}

/*
  generateStaticParams()
  ----------------------

  Se ejecuta únicamente en BUILD TIME.

  Permite indicarle a Next.js qué rutas dinámicas deben
  generarse como páginas estáticas (SSG).

  En este caso generamos 151 páginas:

  /pokemon/1
  /pokemon/2
  ...
  /pokemon/151

  Beneficios:
  - Performance muy alta (contenido pre-renderizado)
  - Mejor SEO
  - Menos trabajo en runtime

  Nota:
  - Con dynamicParams = false -> cualquier id fuera de 1..151 será 404.
*/
export async function generateStaticParams() {
  const static151Pokemons = Array.from({ length: 151 }).map(
    (_, i) => `${i + 1}`,
  );

  return static151Pokemons.map((id) => ({ id }));
}

/*
  generateMetadata()
  ------------------

  Permite generar metadata dinámica por página (SEO).

  Se ejecuta en servidor.

  Cuándo se ejecuta:
  1) Si la página fue generada en build → se ejecuta en build
  2) Si fuese on-demand (cuando dynamicParams=true y la ruta no existía) → en el primer request

  Acá usamos getPokemon(id) para construir title/description dinámicos.

  Importante:
  - Si el pokemon no existe, getPokemon() dispara notFound(),
    lo que termina en 404.
*/
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const { id: pokemonId, name } = await getPokemon(id);

  return {
    title: `#${pokemonId} - ${name}`,
    description: `Página del pokémon ${name}`,
  };
}

/*
  getPokemon()
  ------------

  Función utilitaria para obtener datos del Pokémon desde la PokeAPI.

  - Se ejecuta en el servidor.
  - Usa fetch con cache control de Next.js.
  - Implementa ISR (Incremental Static Regeneration).

  ISR:
  - La página se sirve desde caché/estático.
  - Pasado el tiempo de revalidate, Next puede regenerarla con datos frescos.

  revalidate = 6 meses.

  Importante sobre fetch():
  - fetch() NO lanza error por HTTP 404/500.
  - Solo lanza error si hay problemas de red (DNS, timeout, etc).
  - Por eso se debe verificar resp.ok manualmente.

  Si resp.ok es false, llamamos notFound() para renderizar 404.
*/
const getPokemon = async (id: string): Promise<Pokemon> => {

  'use cache'
  cacheTag('pokemon', id)

  const resp = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
    next: {
      // 60s * 60m * 24h * 30d * 6 = 6 meses
      revalidate: 60 * 60 * 24 * 30 * 6,
    },
  });

  /*
    resp.ok
    -------

    resp.ok es true si el status HTTP está entre 200 y 299.

    Ejemplos:
    - 200 -> ok true
    - 404 -> ok false
    - 500 -> ok false

    Sin este check, podrías hacer resp.json() de un error
    y terminar renderizando datos con forma incorrecta.
  */
  if (!resp.ok) notFound();

  return resp.json();
};

/*
  PokemonPage()
  -------------

  Server Component por defecto (no tiene "use client").

  - Se ejecuta en el servidor.
  - Puede usar fetch directamente.
  - Respeta la estrategia de caché de getPokemon() (ISR).
*/
export default async function PokemonPage({ params }: Props) {
  const { id } = await params;

  const pokemon = await getPokemon(id);

  return (
    <div className="flex mt-5 flex-col items-center text-slate-800">
      {/* Contenedor principal */}
      <div className="relative flex flex-col items-center rounded-[20px] w-[700px] mx-auto bg-white shadow-lg p-3">
        {/* Título del Pokémon */}
        <div className="mt-2 mb-8 w-full">
          <h1 className="px-2 text-xl font-bold text-slate-700 capitalize">
            #{pokemon.id} {pokemon.name}
          </h1>

          {/* Imagen principal y movimientos */}
          <div className="flex flex-col justify-center items-center">
            <Image
              src={pokemon.sprites.other?.dream_world.front_default ?? ""}
              width={150}
              height={150}
              alt={`Imagen del pokemon ${pokemon.name}`}
              className="mb-5"
            />

            {/* Lista de movimientos */}
            <div className="flex flex-wrap">
              {pokemon.moves.map((move) => (
                <p key={move.move.name} className="mr-2 capitalize">
                  {move.move.name}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Información adicional del Pokémon */}
        <div className="grid grid-cols-2 gap-4 px-2 w-full">
          {/* Tipos */}
          <div className="flex flex-col rounded-2xl bg-white px-3 py-4 drop-shadow-lg">
            <p className="text-sm text-gray-600">Types</p>

            <div className="text-base font-medium flex">
              {pokemon.types.map((type) => (
                <p key={type.slot} className="mr-2 capitalize">
                  {type.type.name}
                </p>
              ))}
            </div>
          </div>

          {/* Peso */}
          <div className="flex flex-col rounded-2xl bg-white px-3 py-4 drop-shadow-lg">
            <p className="text-sm text-gray-600">Peso</p>
            <span className="text-base font-medium">{pokemon.weight}</span>
          </div>

          {/* Sprites normales */}
          <div className="flex flex-col rounded-2xl bg-white px-3 py-4 drop-shadow-lg">
            <p className="text-sm text-gray-600">Regular Sprites</p>

            <div className="flex justify-center">
              <Image
                src={pokemon.sprites.front_default}
                width={100}
                height={100}
                alt={`sprite ${pokemon.name}`}
              />
              <Image
                src={pokemon.sprites.back_default}
                width={100}
                height={100}
                alt={`sprite ${pokemon.name}`}
              />
            </div>
          </div>

          {/* Sprites shiny */}
          <div className="flex flex-col rounded-2xl bg-white px-3 py-4 drop-shadow-lg">
            <p className="text-sm text-gray-600">Shiny Sprites</p>

            <div className="flex justify-center">
              <Image
                src={pokemon.sprites.front_shiny}
                width={100}
                height={100}
                alt={`sprite ${pokemon.name}`}
              />
              <Image
                src={pokemon.sprites.back_shiny}
                width={100}
                height={100}
                alt={`sprite ${pokemon.name}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
────────────────────────────────────────────────────────────
RESUMEN DEL COMPORTAMIENTO DE ESTA RUTA (Next.js App Router)
────────────────────────────────────────────────────────────

| Escenario | Ruta | Qué sucede | Por qué |
|----------|------|------------|--------|
| Build | /pokemon/1..151 | Se generan páginas estáticas | generateStaticParams() |
| Usuario entra | /pokemon/25 | Se sirve HTML ya generado | SSG |
| Después de 6 meses | /pokemon/25 | Next puede regenerar la página | ISR (revalidate) |
| Usuario entra | /pokemon/152 | 404 inmediato | dynamicParams = false |
| API devuelve error | /pokemon/9999 | 404 | resp.ok + notFound() |

────────────────────────────────────────────────────────────

Conceptos usados en este archivo:

SSG (Static Site Generation)
Se generan páginas en build time usando generateStaticParams().

ISR (Incremental Static Regeneration)
La página puede regenerarse automáticamente después del tiempo
definido en revalidate.

dynamicParams = false
Solo se permiten rutas definidas en generateStaticParams().

resp.ok
Permite detectar errores HTTP (404, 500) ya que fetch()
solo lanza errores si falla la red.

notFound()
Función de Next.js que interrumpe el render y muestra
la página 404.

────────────────────────────────────────────────────────────
*/
