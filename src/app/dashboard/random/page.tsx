// https://nextjs.org/docs/app/getting-started/cache-components#non-deterministic-operations

import { cacheLife } from "next/cache";

// cache life
// https://nextjs.org/docs/app/api-reference/directives/use-cache#customizing-cache-lifetime

// con esto evitamos problemas tipicos de hidratacion
export default async function RandomPage() {
  "use cache";

  cacheLife({
    stale: 5, // despues de 1 hora, se considera obsoleto el cache
    // stale: 3600, // despues de 1 hora, se considera obsoleto el cache
    revalidate: 10, // despues de 2 horas se vuelve a traer la data
    // revalidate: 7200, // despues de 2 horas se vuelve a traer la data
    expire: 86400, // despues de 1 dia se elimina el cache, limpia todo y cuando se vuelva a hacer la solicitud se vuelve a traer la data
  })

  // Non-deterministic operations
  const random = Math.random();
  const now = Date.now();
  const date = new Date();
  const uuid = crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));

  return (
    <div>
      <p>{random}</p>
      <p>{now}</p>
      <p>{date.getTime()}</p>
      <p>{uuid}</p>
      <p>{bytes}</p>
    </div>
  );
}
