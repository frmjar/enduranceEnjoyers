import { useState } from 'react'

export default function Calculadora () {
  const [a, setA] = useState(0)
  const [b, setB] = useState(0)
  const [resultado, setResultado] = useState<number | null>(null)

  const calcular = async () => {
    const res = await fetch('/api/calcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a, b })
    })
    const data = await res.json()
    setResultado(data.resultado)
  }

  return (
    <div>
      <input type='number' value={a} onChange={e => setA(+e.target.value)} />
      <input type='number' value={b} onChange={e => setB(+e.target.value)} />
      <button onClick={calcular}>Calcular</button>
      {resultado !== null && <p>Resultado: {resultado}</p>}
    </div>
  )
}
