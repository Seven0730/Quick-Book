import { GenericContainer } from "testcontainers";
import { execSync } from "child_process";
import fs from "fs";

export default async function () {
  const container = await new GenericContainer('postgres:15-alpine')
    .withEnvironment({
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'test',
      POSTGRES_DB: 'testdb',
    })
    .withExposedPorts(5432)
    .start();

  const port = container.getMappedPort(5432);
  const host = container.getHost();

  const url = `postgresql://test:test@${host}:${port}/testdb?schema=public`;
  fs.writeFileSync(".testenv", `DATABASE_URL="${url}"\n`);

  execSync("npx prisma migrate deploy --schema=prisma/schema.prisma", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url }
  });

  (global as any).__TEST_CONTAINER__ = container;
}
