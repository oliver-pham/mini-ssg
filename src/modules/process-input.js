const { existsSync, statSync } = require('fs');
const { readdir, mkdir, rm } = require('fs/promises');
const path = require('path');

const { processFile } = require('./generate-html');

/**
 * Processes user's specified input and determine whether it's a directory, text file or non-text file.
 *
 * @param {string} inputPath - A path to a file/directory
 * @param {string} stylesheetUrl - URL link to a CSS stylesheet
 * @param {string} language - Language used when generating HTML
 */
async function processInputs(inputPath, stylesheetUrl, language) {
  const distPath = path.join(__dirname, '../../', 'dist');
  await manageDir(distPath);
  const assetsPath = path.join(__dirname, '../../', 'assets');
  await manageDir(assetsPath);

  const retrievedFiles = await processPath(inputPath);

  if (Array.isArray(retrievedFiles)) {
    retrievedFiles.forEach((file) => {
      processFile(path.join(inputPath, file), stylesheetUrl, language);
    });
    return;
  }

  processFile(inputPath, stylesheetUrl, language);
  return;
}

async function processPath(inputPath) {
  if (!existsSync(inputPath)) {
    throw new Error('File/directory does not exist.');
  }

  if (statSync(inputPath).isDirectory()) {
    const entries = await readdir(inputPath);

    // Filters out any non-text and non-markdown files
    const validFiles = entries.filter((entry) => {
      return (
        statSync(path.join(inputPath, entry)).isFile() &&
        (path.extname(entry) === '.txt' || path.extname(entry) === '.md')
      );
    });
    return validFiles;
  }

  if (path.extname(inputPath) !== '.txt' && path.extname(inputPath) !== '.md') {
    throw new Error("File extension must be '.txt' or '.md'.");
  }
  return inputPath;
}

/**
 * Recursively deletes the specifies directory and creates a new one.
 */
async function manageDir(dirPath) {
  try {
    await rm(dirPath, {
      recursive: true,
      force: true,
    });

    await mkdir(dirPath);
  } catch (err) {
    console.log(err);
  }
}

module.exports = { processInputs, processPath };
