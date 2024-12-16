import path from "path"; //const path = require("path");
import bluebird from "bluebird"; //const bluebird = require("bluebird");
import fs from "fs";
import { fileURLToPath } from "url";
const fsPromise = bluebird.promisifyAll(fs);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const outDir = path.resolve("./dist/" || process.env.OUT_DIR);
const configPath = path.join(outDir, "config.json");
const blogPath = path.join(outDir, "blog.json");

const defaultConfigPath = path.resolve(`${__dirname}/default/config.json`);
const defaultBlogPath = path.resolve(`${__dirname}/default/blog.json`);

/**
 * Tries to read file from out dir,
 * if not present returns default file contents
 */
async function getFileWithDefaults(file, defaultFile) {
  try {
    await fsPromise.accessAsync(file, fsPromise.constants.F_OK);
  } catch (err) {
    const defaultData = await fsPromise.readFileAsync(defaultFile);
    return JSON.parse(defaultData);
  }
  const data = await fsPromise.readFileAsync(file);
  return JSON.parse(data);
}

export async function getConfig() {
  return getFileWithDefaults(configPath, defaultConfigPath);
}

export async function getBlog() {
  return getFileWithDefaults(blogPath, defaultBlogPath);
}

//module.exports = {
//  outDir,
//  getConfig,
//  getBlog
//};
