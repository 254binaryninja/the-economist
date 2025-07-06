"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Paperclip, X, ChevronDown, ArrowUp } from "lucide-react";

export interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (
    e: React.FormEvent,
    options?: { files?: FileList; systemMode?: string },
  ) => void;
  isLoading?: boolean;
  placeholder?: string;
  systemMode?: string;
  onSystemModeChange?: (mode: string) => void;
  showSystemModeSelector?: boolean;
  maxFiles?: number;
  acceptedFileTypes?: string;
}

const SYSTEM_MODES = [
  { value: "normal", label: "Normal" },
  { value: "keynesian", label: "Keynesian" },
  { value: "classical", label: "Classical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "monetarist", label: "Monetarist" },
];

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  isLoading = false,
  placeholder = "Message Economist AI...",
  systemMode = "normal",
  onSystemModeChange,
  showSystemModeSelector = true,
  maxFiles = 10,
  acceptedFileTypes = "*/*",
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [files, setFiles] = useState<FileList | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > maxFiles) {
      alert(`You can only select up to ${maxFiles} files`);
      return;
    }
    setFiles(selectedFiles);
  };

  const removeFile = (indexToRemove: number) => {
    if (!files) return;

    const dt = new DataTransfer();
    Array.from(files).forEach((file, index) => {
      if (index !== indexToRemove) {
        dt.items.add(file);
      }
    });
    setFiles(dt.files);

    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files;
    }
  };

  const clearFiles = () => {
    setFiles(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !files?.length) return;

    onSubmit(e, {
      files: files || undefined,
      systemMode: showSystemModeSelector ? systemMode : undefined,
    });

    clearFiles();
  };
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Keep it single line for rectangle appearance
      textarea.style.height = "24px";
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
    adjustTextareaHeight();
  };
  const fileArray = files ? Array.from(files) : [];

  // Auto-adjust textarea height when input changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      {/* System Mode Selector */}
      {showSystemModeSelector && onSystemModeChange && (
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-sm font-medium text-foreground">
            Analysis Mode:
          </span>
          <div className="relative w-full sm:w-auto">
            <select
              value={systemMode}
              onChange={(e) => onSystemModeChange(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-background border border-border rounded-lg px-3 py-2 pr-8 text-sm font-medium text-foreground hover:border-border/80 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              {SYSTEM_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      )}{" "}
      {/* File Attachments Display */}
      {fileArray.length > 0 && (
        <div className="mb-3 p-3 bg-muted/50 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Attached files ({fileArray.length})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFiles}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </div>
          <div className="space-y-2">
            {fileArray.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
              >
                <span className="text-sm text-foreground truncate flex-1 mr-3">
                  {file.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-destructive p-2 h-auto shrink-0 touch-manipulation rounded-md"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}{" "}
      {/* Main Input Container */}
      <div className="relative bg-background border border-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 focus-within:shadow-lg focus-within:border-orange-500">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-4 p-4 min-h-[64px]"
        >
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFileTypes}
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* File Attachment Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="shrink-0 h-10 w-10 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 touch-manipulation rounded-lg"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-base leading-6 max-h-[32px] overflow-hidden py-1"
            style={{ minHeight: "24px" }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || (!input.trim() && !files?.length)}
            className="shrink-0 h-10 w-10 p-0 bg-orange-500 hover:bg-orange-600 disabled:bg-muted disabled:cursor-not-allowed rounded-lg transition-all duration-200 touch-manipulation"
          >
            <ArrowUp className="h-5 w-5 text-white" />
          </Button>
        </form>
      </div>
    </div>
  );
}
