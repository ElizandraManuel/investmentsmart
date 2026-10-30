import { useState } from 'react';
import type { ChangeEvent } from 'react';

type Field = ChangeEvent<HTMLInputElement | HTMLSelectElement>;

/** Estado de um formulário: f (valores), set('campo') (onChange) e setF (substituir tudo). */
export default function useForm<T extends Record<string, string>>(initial: T) {
  const [f, setF] = useState<T>(initial);
  const set = (key: keyof T) => (e: Field) => setF({ ...f, [key]: e.target.value } as T);
  return { f, set, setF };
}
