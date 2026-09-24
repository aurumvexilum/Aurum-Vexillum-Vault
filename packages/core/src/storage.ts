export interface VaultStorage<T> {
  save(value: T, password: string): Promise<void>;
  load(password: string): Promise<T>;
  exists(): Promise<boolean>;
  export(): Promise<string>;
  import(serialized: string): Promise<void>;
}

export interface NativeVaultAdapter {
  save(value: string, password: string): Promise<void>;
  load(password: string): Promise<string>;
  clear(): Promise<void>;
}

export class VaultService<T> {
  constructor(private readonly storage: VaultStorage<T>) {}

  save(value: T, password: string) {
    return this.storage.save(value, password);
  }

  load(password: string) {
    return this.storage.load(password);
  }

  exists() {
    return this.storage.exists();
  }

  export() {
    return this.storage.export();
  }

  import(serialized: string) {
    return this.storage.import(serialized);
  }
}
