import { Pokemon } from "@/pokemons";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

// En Next.js 15+, `params` en rutas dinámicas es una Promise.
// Esto permite que el framework optimice la resolución de datos en el server.
interface Props {
  params: Promise<{
    id: string;
  }>;
}

/*
  generateStaticParams()
  ----------------------
  Se ejecuta únicamente en build time.
  Permite pre-generar rutas estáticas para mejorar performance (SSG).

  En este caso:
  - Se generan 151 páginas estáticas (Pokémon 1 al 151)
  - Si el usuario accede a un ID fuera de ese rango (ej: 152),
    la página se generará on-demand y quedará cacheada para futuras visitas.
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
  Permite generar metadata dinámica por página.

  - Se ejecuta en el servidor.
  - Si la página está pre-generada, se ejecuta en build time.
  - Si es generada on-demand, se ejecuta en el primer request.
*/
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;

    // Se obtiene el Pokémon para construir title y description dinámicos
    const { id: pokemonId, name } = await getPokemon(id);

    return {
      title: `#${pokemonId} - ${name}`,
      description: `Página del pokémon ${name}`,
    };
  } catch (error) {
    return {
      title: "Página del pokémon no encontrada",
      description: "No se pudo cargar la información del pokémon",
    };
  }
}

/*
  getPokemon()
  ------------
  - Fetch server-side
  - Usa revalidación incremental (ISR)
  - El contenido se revalida cada 6 meses

  Si ocurre un error o el Pokémon no existe,
  se dispara `notFound()` que renderiza la página 404.
*/
const getPokemon = async (id: string): Promise<Pokemon> => {
  try {
    const pokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
      next: {
        // Revalidación cada 6 meses (ISR)
        revalidate: 60 * 60 * 24 * 30 * 6,
      },
    }).then((resp) => resp.json());

    return pokemon;
  } catch (error) {
    notFound();
  }
};

/*
  PokemonPage()
  -------------
  Server Component por defecto.

  - Se ejecuta en el servidor.
  - Puede usar fetch directamente.
  - Respeta la estrategia de cache definida en getPokemon().
*/
export default async function PokemonPage({ params }: Props) {
  const { id } = await params;
  const pokemon = await getPokemon(id);

  return (
    <div className="flex mt-5 flex-col items-center text-slate-800">
      {/* Contenedor principal */}
      <div className="relative flex flex-col items-center rounded-[20px] w-[700px] mx-auto bg-white shadow-lg p-3">
        {/* Título */}
        <div className="mt-2 mb-8 w-full">
          <h1 className="px-2 text-xl font-bold text-slate-700 capitalize">
            #{pokemon.id} {pokemon.name}
          </h1>

          {/* Imagen principal + movimientos */}
          <div className="flex flex-col justify-center items-center">
            <Image
              src={pokemon.sprites.other?.dream_world.front_default ?? ""}
              width={150}
              height={150}
              alt={`Imagen del pokemon ${pokemon.name}`}
              className="mb-5"
            />

            <div className="flex flex-wrap">
              {pokemon.moves.map((move) => (
                <p key={move.move.name} className="mr-2 capitalize">
                  {move.move.name}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-2 gap-4 px-2 w-full">
          {/* Types */}
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
