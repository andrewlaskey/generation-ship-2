import { useState, useEffect } from 'react';
import { TileConfigLoader, TileRulesMap } from '@/modules/TileConfigLoader';

const configLoader = new TileConfigLoader();

export function useConfig() {
  const [config, setConfig] = useState<TileRulesMap>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        if (configLoader.configsLoaded()) {
          setConfig(configLoader.getRules());
        } else {
          const configs = await configLoader.load();
          setConfig(configs);
        }
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
