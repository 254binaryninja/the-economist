// Utility functions for handling file attachments in AI SDK format

export async function fileToAttachment(file: File) {
  // Convert file to base64 data URL for images
  if (file.type.startsWith('image/')) {
    return new Promise<{ name: string; contentType: string; url: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: file.name,
          contentType: file.type,
          url: reader.result as string,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  // For text files, read content as text
  if (file.type.startsWith('text/') || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
    return new Promise<{ name: string; contentType: string; content: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: file.name,
          contentType: file.type,
          content: reader.result as string,
        });
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
  
  // For PDFs and other binary files, convert to base64
  return new Promise<{ name: string; contentType: string; url: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        contentType: file.type,
        url: reader.result as string,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function filesToAttachments(files: FileList) {
  const attachments = [];
  for (const file of Array.from(files)) {
    try {
      const attachment = await fileToAttachment(file);
      attachments.push(attachment);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
    }
  }
  return attachments;
}
