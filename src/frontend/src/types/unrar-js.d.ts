declare module "unrar-js" {
  // Add minimal type definitions as needed
  export interface ExtractedFile {
    fileHeader: {
      name: string;
      flags: { directory: boolean };
    };
    extract(): Uint8Array;
  }

  export class Extractor {
    constructor(buffer: Uint8Array);
    extractAll(): Promise<ExtractedFile[]>;
  }
}
