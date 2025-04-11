import { ThreeTextureLibrary } from '@/modules/Three/ThreeTextureLibrary';
import { useEffect, useState } from 'react';

const textureLoader = new ThreeTextureLibrary();
let globalTextureLibraryPromise: Promise<ThreeTextureLibrary> | null = null;

const loadTextures = async (): Promise<ThreeTextureLibrary> => {
  await textureLoader.loadTextures();
  return textureLoader;
};

export function useTextures() {
  const [textureLibrary, setTextureLibrary] = useState<ThreeTextureLibrary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTextures() {
      try {
        if (!globalTextureLibraryPromise) {
          if (textureLoader.hasLoadedTextures) {
            globalTextureLibraryPromise = Promise.resolve(textureLoader);
          } else {
            globalTextureLibraryPromise = loadTextures();
          }
        }

        const library = await globalTextureLibraryPromise;
        setTextureLibrary(library);
      } catch (error) {
        console.error(error);
        setError('Failed to load tile rules.');
      } finally {
        setLoading(false);
      }
    }

    fetchTextures();
  }, []);

  return { textureLibrary, loading, error };
}
