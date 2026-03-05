// https://nextjs.org/docs/app/getting-started/cache-components#non-deterministic-operations

// con esto evitamos problemas tipicos de hidratacion
export default async function RandomPage() {
  "use cache";

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
