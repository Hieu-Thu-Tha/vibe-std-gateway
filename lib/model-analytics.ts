// In-memory quarantine cache: Map<modelName, expiresAt>
const quarantineCache = new Map<string, number>();

export const quarantineModel = async (model: string) => {
  const expiresAt = Date.now() + (Number(process.env.MODEL_QUARANTINE_MS) || 120_000);
  quarantineCache.set(model, expiresAt);
  console.log(`Quarantined ${model} until ${new Date(expiresAt).toISOString()}`);
};

export const getAndRefreshQuarantinedModels = async (): Promise<
  Map<string, number>
> => {
  const now = Date.now();
  const stillQuarantined = new Map<string, number>();

  for (const [model, expiresAt] of quarantineCache.entries()) {
    if (expiresAt > now) {
      stillQuarantined.set(model, expiresAt);
    } else {
      quarantineCache.delete(model);
    }
  }

  return stillQuarantined;
};
