import { useState, useEffect } from 'react';
import { TileConfigLoader, TileRulesMap } from '@/modules/TileConfigLoader';

const configLoader = new TileConfigLoader();
let globalConfigPromise: Promise<TileRulesMap> | null = null;

export function useConfig() {
  const [config, setConfig] = useState<TileRulesMap>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        if (!globalConfigPromise) {
          if (configLoader.configsLoaded()) {
            globalConfigPromise = Promise.resolve(configLoader.getRules());
          } else {
            globalConfigPromise = configLoader.load();
          }
        }

        const configs = await globalConfigPromise;
        setConfig(configs);
      } catch (error) {
        console.error(error);
        setError('Failed to load tile rules.');
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  return { config, loading, error };
}
