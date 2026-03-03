import { CartCounter } from "@/shopping-cart";

export const metadata = {
  title: "Shopping Cart",
  description: "Un simple contador",
};

export default function CounterPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="mb-4">
        <h3 className="font-bold">Notas</h3>
        <p>
          <span className="font-semibold">CartCounter</span>: Este componente es
          un componente del lado del cliente ya que usa useState
        </p>
        <p>
          Desde el <span className="font-semibold">servidor</span> podriamos
          leer algun valor grabado en las bases de datos, cookies, etc y
          mandarselo como prop al componente, de esta forma mandamos algo
          generado en el backend, al cliente{" "}
        </p>
        <p>
          Los <span className="font-semibold">servers component</span> solo se
          construyen una vez, se renderiza solo una vez, cuando el componente se
          crea. Podriamos tener un fetch, conexion a base de datos, entre otras
          cosas, como mandar usuarios de bases de datos sin necesidad de hacer
          fetch api, y veremos los servers actions mas adelante.
        </p>
      </div>

      <span className="text-2xl">Productos en el carrito</span>
      {/* este componente es un componente del lado del cliente ya que usa useState o redux */}
      <CartCounter value={20} />
    </div>
  );
}
