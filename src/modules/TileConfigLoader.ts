import { TileRuleConfig } from './TileRules';

export class TileConfigLoader {
  private configs: Map<string, TileRuleConfig> = new Map();
  private loaded: boolean = false;

  constructor(private basePath: string = import.meta.env.BASE_URL + 'config/') {}

  configsLoaded(): boolean {
    return this.loaded;
  }

  getRules(tileType: string): TileRuleConfig | undefined {
    return this.configs.get(tileType);
  }

  async load(): Promise<Map<string, TileRuleConfig>> {
    if (this.loaded) {
      return this.configs;
    }

    try {
      const ruleFiles = await this.getConfigFilesList();

      if (ruleFiles.length === 0) {
        console.warn('No rule files found in config directory');
      }

      const loadPromises = ruleFiles.map(file => this.loadRuleFile(file));
      await Promise.all(loadPromises);

      this.loaded = true;
      console.log(`Loaded ${this.configs.size} tile rule configurations`);
      return this.configs;
    } catch (error) {
      console.error('Failed to load tile rules:', error);
      throw error;
    }
  }

  private async getConfigFilesList(): Promise<string[]> {
    try {
      // Fetch the directory index file
      const response = await fetch(`${this.basePath}index.json`);

      if (!response.ok) {
        // If index.json doesn't exist, fallback to hardcoded default files
        console.warn(`No index.json found at ${this.basePath}, falling back to default files`);
        return [
          'tree-rules.json',
          'farm-rules.json',
          'people-rules.json',
          'power-rules.json',
          'waste-rules.json',
          'empty-rules.json',
        ];
      }

      // Parse the index file which should contain an array of filenames
      const files = await response.json();

      if (!Array.isArray(files)) {
        throw new Error('Config index file does not contain a valid array of filenames');
      }

      // Filter to only include JSON files
      return files.filter(file => file.endsWith('.json') && file !== 'index.json');
    } catch (error) {
      console.error('Error getting config files list:', error);

      throw new Error('Could not load config files list');
    }
  }

  private async loadRuleFile(filename: string): Promise<void> {
    try {
      const response = await fetch(`${this.basePath}${filename}`);

      if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.statusText}`);
      }

      const rules: TileRuleConfig = await response.json();

      // Add to the map using the tile type as key
      this.configs.set(rules.type, rules);
      console.log(`Loaded rules for ${rules.type} tile`);
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
    }
  }
}
