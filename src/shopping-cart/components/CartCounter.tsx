"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";

// no lo ponemos en un archivo de barril porque es buena idea saber bien de donde importamos la accion
import {
  addOne,
  initCounterState,
  resetCount,
  substractOne,
} from "@/lib/features/counter/counterSlice";
import { useEffect } from "react";

// import { useState } from 'react'

// NO PODEMOS USAR METADATA EN UN COMPONENTE CLIENT SIDE
// hacer lo que decimaos de las hojas del arbol, hacer componentes del lado del cliente muy pequeños
// la pagina que usara este componente podra tener la metadata

interface Props {
  value?: number;
}

export interface CounterResponse {
  method: string;
  count: number;
}

// valor del counter desde API
const getApiCounter = async (): Promise<CounterResponse> => {
  // const data = await fetch('http://localhost:3000/api/counter')
  // podriamos crear una interface para definir la controlar la data, y tambien controlar errores con trycatch, then, catch, etc.
  const data = await fetch("/api/counter").then((res) => res.json());

  console.log(data);

  // si ponemos que la funcion devuelve Promise<CounterResponse>, el return es el que pusimos, en caso de no poner esto podemos poner
  // return data as CounterResponse
  return data;
};

export const CartCounter = ({ value = 10 }: Props) => {
  // usando useState
  // const [count, setCount] = useState(value)

  // usando Redux
  const count = useAppSelector((state) => state.counter.count); // accedo al estado del counter

  const dispatch = useAppDispatch(); // accedo a las acciones del counter o sus metodos para interactuar con él

  // a pesar de llamar el initCounterState cada vez que se renderize el componente, este gracias a la propiedad isReady no se resetea
  // esto lo ponemos o sacamos como nosotros querramos, dependiendo de como querramos inicializar el count sid esde el backend con una base de datos o desde el reducer
  useEffect(() => {
    dispatch(initCounterState(value));
  }, [dispatch, value]);

  // COMENTAR EL EFFECT DEL API O EL DE ARRIBA

  // llamando la funcion que trae el api
  // de esta forma leemos el count desde el API
  // useEffect(() => {
  //   // cuando la promesa me devuelva lo que quiero lo ejecuto
  //   getApiCounter().then(data => dispatch(initCounterState(data.count)))

  // }, [dispatch])

  return (
    <>
      <span className="text-9xl">{count}</span>

      <div className="flex">
        <button
          // onClick={() => setCount(count - 1)}
          onClick={() => dispatch(substractOne())}
          className="flex items-center justify-center p-2 rounded-xl bg-gray-900 text-white hover:bg-gray-600 transition-all w-[100px] mr-2"
        >
          -1
        </button>
        <button
          // onClick={() => setCount(count + 1)}
          onClick={() => dispatch(addOne())}
          className="flex items-center justify-center p-2 rounded-xl bg-gray-900 text-white hover:bg-gray-600 transition-all w-[100px] mr-2"
        >
          +1
        </button>
      </div>
      <p>
        Si deshabilitamos javascript en el navegador o cliente este componente
        no trabajara como se espera
      </p>
    </>
  );
};
