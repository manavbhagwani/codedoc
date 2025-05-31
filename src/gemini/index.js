const { createPartFromUri, GoogleGenAI } = require("@google/genai");
const fs = require("fs/promises"); // Added import for fs.promises
const path = require("path"); // Added import for path module
const config = require("../config");

const MAX_FILES_TO_UPLOAD = 15; // Added constant for max files

const ai = new GoogleGenAI({
  apiKey: config.gemini.apiKey,
});

async function uploadLocalFile(filePath, displayName) {
  // Renamed function and changed parameter
  const pdfBuffer = await fs.readFile(filePath); // Read file from local file system

  const fileBlob = new Blob([pdfBuffer], { type: "text/plain" });

  const file = await ai.files.upload({
    file: fileBlob,
    config: {
      displayName: displayName,
    },
  });

  // Wait for the file to be processed.
  let getFile = await ai.files.get({ name: file.name });
  while (getFile.state === "PROCESSING") {
    getFile = await ai.files.get({ name: file.name });
    console.log(`current file status: ${getFile.state}`);
    console.log("File is still processing, retrying in 5 seconds");

    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
  }
  if (file.state === "FAILED") {
    throw new Error("File processing failed.");
  }

  return file;
}

// New function to recursively read and upload files
async function uploadFilesInDirectory(
  directoryPath,
  baseDirectory,
  contentArray,
  counter // Added counter parameter
) {
  if (counter.count >= MAX_FILES_TO_UPLOAD) {
    return;
  }

  const items = await fs.readdir(directoryPath);
  for (const item of items) {
    if (counter.count >= MAX_FILES_TO_UPLOAD) {
      break;
    }
    const itemPath = path.join(directoryPath, item);
    const stat = await fs.stat(itemPath);
    const relativePath = path.relative(baseDirectory, itemPath); // Get path relative to base repo directory

    if (stat.isFile()) {
      console.log(`Uploading file: ${relativePath} (Count: ${counter.count})`);
      try {
        const uploadedFile = await uploadLocalFile(itemPath, relativePath); // Use relativePath as displayName
        if (uploadedFile.uri && uploadedFile.mimeType) {
          const fileContent = createPartFromUri(
            uploadedFile.uri,
            uploadedFile.mimeType
          );
          contentArray.push(fileContent);
          counter.count++; // Increment counter
          console.log(
            `Added ${relativePath} to content. Current count: ${counter.count}`
          );
          if (counter.count >= MAX_FILES_TO_UPLOAD) {
            console.log(`Reached file limit of ${MAX_FILES_TO_UPLOAD}.`);
            break; // Exit loop if limit is reached
          }
        } else {
          console.warn(`Could not get URI or MIME type for ${relativePath}`);
        }
      } catch (error) {
        console.error(
          `Failed to upload or process file ${relativePath}:`,
          error
        );
      }
    } else if (stat.isDirectory()) {
      // Recursively process subdirectories
      await uploadFilesInDirectory(
        itemPath,
        baseDirectory,
        contentArray,
        counter
      ); // Pass counter
      if (counter.count >= MAX_FILES_TO_UPLOAD) {
        break;
      }
    }
  }
}

async function main() {
  const content = [
    "Going through these js files of this application repo, document the application at high level without getting into code details. Documentation format should be such that it can be directly pushed into atlassian confluence wiki page. Include simple mermaid diagrams where applicable.",
  ];

  const repoDirectory = path.join(process.cwd(), "src/repo"); // Assumes 'repo' is in the same directory as load.js
  const fileUploadCounter = { count: 0 }; // Initialize counter object
  console.log(`Starting to process files in: ${repoDirectory}`);
  await uploadFilesInDirectory(
    repoDirectory,
    repoDirectory,
    content,
    fileUploadCounter
  ); // Pass counter
  console.log(
    `Finished processing files. Total content parts: ${content.length}`
  );

  if (content.length <= 1) {
    console.error(
      "No files were successfully processed and added to content. Aborting LLM call."
    );
    return;
  }

  console.log("Content:", content);

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: content,
  });

  console.log(response.text);
  return Promise.resolve(response.text);
}

module.exports = main;
