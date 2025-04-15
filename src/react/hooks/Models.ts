import { ThreeModelLibrary } from '@/modules/Three/ThreeModelLibrary';
import { useEffect, useState } from 'react';

const modelLibraryLoader = new ThreeModelLibrary();
let globalModelLibraryPromise: Promise<ThreeModelLibrary> | null = null;

const loadModels = async (): Promise<ThreeModelLibrary> => {
  await modelLibraryLoader.loadModels();
  return modelLibraryLoader;
};

export function useModels() {
  const [modelLibrary, setModelLibrary] = useState<ThreeModelLibrary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTextures() {
      try {
        if (!globalModelLibraryPromise) {
          if (modelLibraryLoader.hasLoadedModels) {
            globalModelLibraryPromise = Promise.resolve(modelLibraryLoader);
          } else {
            globalModelLibraryPromise = loadModels();
          }
        }

        const library = await globalModelLibraryPromise;
        setModelLibrary(library);
      } catch (error) {
        console.error(error);
        setError('Failed to load tile rules.');
      } finally {
        setLoading(false);
      }
    }

    fetchTextures();
  }, []);

  return { modelLibrary, loading, error };
}
