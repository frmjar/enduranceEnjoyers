export const prerender = false

export async function POST ({ request }: { request: Request }) {
  const { a, b } = await request.json()
  const resultado = a * b
  return Response.json({
    resultado,
    mensaje: `El resultado de la suma de ${a} y ${b} multiplicado por 42 es ${resultado}.`
  })
}
