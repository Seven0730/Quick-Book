export default async function () {
  const container = (global as any).__TEST_CONTAINER__;
  if (container) {
    await container.stop();
  }
}
