import Fastify from 'fastify'

const app = Fastify()
app.get('/health', async () => ({ ok: true }))
app.listen({ port: 4000 })
