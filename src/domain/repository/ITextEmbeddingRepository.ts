

export type DocumentMetadata = {
  documentName: string;
  documentType: 'pdf' | 'docx' | 'xlsx' | 'txt' | 'csv' | 'url';
  documentSummary:string
}

export type DocumentMetadataGenerator = {
  text:string;
  type:'pdf' | 'docx' | 'xlsx' | 'txt' | 'csv' | 'url';
}

export interface TextChunkEmbedding {
  content: string;
  embedding: number[];
}

export interface ITextEmbeddingRepository {
  /**
   * Extracts and returns the full text from a given file path.
   * Supports formats like PDF, DOCX, XLSX, PPTX, TXT, CSV.
   * @param filePath - Path to the file on disk
   * @returns Extracted text as a single string
   */
  extractText(filePath: string): Promise<string>;

  /**
   * Extracts text from a URL.
   * @param url - The URL to extract text from
   * @returns Extracted text as a single string
   */
  extractTextFromUrl(url: string): Promise<string>;

  /**
   * Generates a Document object from the text,
   *  including metadata like name, type, and summary.
  * @param text - The extracted text
  * @param type - the document type
  * @returns Document object
  */
  generateDocumentMetadata(document:DocumentMetadataGenerator):Promise<DocumentMetadata>


  /**
   * Generates an embedding vector from a given text.
   * @param text - Input text to embed
   * @returns Embedding as an array of numbers
   */
  embedText(text: string): Promise<TextChunkEmbedding[]>;
}