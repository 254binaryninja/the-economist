import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  DocumentMetadata,
  DocumentMetadataGenerator,
  ITextEmbeddingRepository,
  TextChunkEmbedding,
} from "../repository/ITextEmbeddingRepository";
import { injectable } from "inversify";
import { getTextExtractor } from "office-text-extractor";
import { readFile } from "fs/promises";
import { embedMany, generateText } from "ai";

@injectable()
export class ITextEmbeddingService implements ITextEmbeddingRepository {
  private textSplitter: RecursiveCharacterTextSplitter;
  private googleAI: any;
  private extractor = getTextExtractor();

  constructor() {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    this.googleAI = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY || "",
    });
  }
  async extractText(filePath: string): Promise<string> {
    try {
      const buffer = await readFile(filePath);
      const text = await this.extractor.extractText({
        input: buffer,
        type: "buffer",
      });
      if (!text) {
        throw new Error("Text extraction failed");
      }
      return text.replace(/\s+/g, " ").trim();
    } catch (error) {
      console.error("Ërror extracting text from the file", error);
      throw new Error("File text extraction failed");
    }
  }
  async extractTextFromUrl(url: string): Promise<string> {
    try {
      const text = await this.extractor.extractText({
        input: url,
        type: "url",
      });
      if (!text) {
        throw new Error("URL text extraction falied");
      }
      return text.replace(/\s+/g, " ").trim();
    } catch (error) {
      console.error("Error extracting text from URL", error);
      throw new Error("Ërror extracting text from URL");
    }
  }

  async generateDocumentMetadata(
    document: DocumentMetadataGenerator,
  ): Promise<DocumentMetadata> {
    try {
      const prompt = `Analyze the following text and provide a concise summary in 2-3 sentences:

Text: ${document.text.substring(0, 2000)}...

Please provide only the summary without any additional formatting or explanation.`;

      const { text: summary } = await generateText({
        model: this.googleAI("gemini-1.5-flash"),
        prompt: prompt,
        maxTokens: 150,
        temperature: 0.3,
      });

      // Generate document name from first 50 characters or use type-based naming
      const firstLine = document.text.split("\n")[0] || "";
      const documentName =
        firstLine.length > 0
          ? firstLine.substring(0, 50).trim() +
            (firstLine.length > 50 ? "..." : "")
          : `Document.${document.type}`;

      return {
        documentName: documentName,
        documentType: document.type,
        documentSummary: summary.trim(),
      };
    } catch (error) {
      console.error("Error generating document metadata", error);
      throw new Error("Error generating document metadata");
    }
  }

  async embedText(text: string): Promise<TextChunkEmbedding[]> {
    try {
      const chunks = await this.textSplitter.splitText(text);

      // Use Google's text embedding model
      const { embeddings } = await embedMany({
        model: this.googleAI.textEmbedding("text-embedding-004"),
        values: chunks,
      });

      const textChunkEmbeddings: TextChunkEmbedding[] = chunks.map(
        (chunk, index) => ({
          content: chunk,
          embedding: embeddings[index],
        }),
      );

      return textChunkEmbeddings;
    } catch (error) {
      console.error("Error embedding text", error);
      throw new Error("Text embedding failed");
    }
  }
}
