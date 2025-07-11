import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import type {
  ITextEmbeddingRepository,
  DocumentMetadataGenerator,
} from "../domain/repository/ITextEmbeddingRepository";

@injectable()
export class TextEmbeddingController {
  constructor(
    @inject(TYPES.ITextEmbeddingRepository)
    private textEmbeddingRepository: ITextEmbeddingRepository,
  ) {}

  async extractText(filePath: string) {
    return this.textEmbeddingRepository.extractText(filePath);
  }

  async extractTextFromUrl(url: string) {
    return this.textEmbeddingRepository.extractTextFromUrl(url);
  }

  async generateDocumentMetadata(document: DocumentMetadataGenerator) {
    return this.textEmbeddingRepository.generateDocumentMetadata(document);
  }

  async embedText(text: string) {
    return this.textEmbeddingRepository.embedText(text);
  }
}
