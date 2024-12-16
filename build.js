/* Filepath utilities */
import path from "path"; //const path = require("path");
/* Promise library */
import bluebird from "bluebird"; //const bluebird = require("bluebird");
import hbs from "handlebars"; //const hbs = require("handlebars");
/*  Creates promise-returning async functions
    from callback-passed async functions      */
import fs from "fs";
import { fileURLToPath } from "url";
const fsPromise = bluebird.promisifyAll(fs);
import { updateHTML } from "./populate.js"; //const { updateHTML } = require("./populate");
import { getConfig, outDir } from "./utils.js"; //const { getConfig, outDir } = require("./utils");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetDir = path.resolve(`${__dirname}/assets/`);
const config = path.join(outDir, "config.json");

/**
 * Creates the stylesheet used by the site from a template stylesheet.
 *
 * Theme styles are added to the new stylesheet depending on command line
 * arguments.
 */
export async function populateCSS({
  theme = "light",
  background = "https://images.unsplash.com/photo-1553748024-d1b27fb3f960?w=1500&q=80"
} = {}) {
  /* Get the theme the user requests. Defaults to 'light' */
  theme = `${theme}.css`;
  let template = path.resolve(assetDir, "index.css");
  let stylesheet = path.join(outDir, "index.css");

  try {
    await fsPromise.accessAsync(outDir, fs.constants.F_OK);
  } catch (err) {
    await fsPromise.mkdirAsync(outDir);
  }
  /* Copy over the template CSS stylesheet */
  await fsPromise.copyFileAsync(template, stylesheet);

  /* Get an array of every available theme */
  let themes = await fsPromise.readdirAsync(path.join(assetDir, "themes"));

  if (!themes.includes(theme)) {
    console.error('Error: Requested theme not found. Defaulting to "light".');
    theme = "light";
  }
  /* Read in the theme stylesheet */
  let themeSource = await fsPromise.readFileSync(path.join(assetDir, "themes", theme));
  themeSource = themeSource.toString("utf-8");
  let themeTemplate = hbs.compile(themeSource);
  let styles = themeTemplate({
    background: `${background}`
  });
  /* Add the user-specified styles to the new stylesheet */
  await fsPromise.appendFileAsync(stylesheet, styles);

  /* Update the config file with the user's theme choice */
  const data = await getConfig();
  data[0].theme = theme;
  await fsPromise.writeFileAsync(config, JSON.stringify(data, null, " "));
}

export async function populateConfig(opts) {
  const data = await getConfig();
  Object.assign(data[0], opts);
  await fsPromise.writeFileAsync(config, JSON.stringify(data, null, " "));
}

export async function buildCommand(username, program) {
  await populateCSS(program);
  let types;
  if (!program.include || !program.include.length) {
    types = ["all"];
  } else {
    types = program.include;
  }
  const opts = {
    sort: program.sort,
    order: program.order,
    includeFork: program.fork ? true : false,
    types,
    twitter: program.twitter,
    linkedin: program.linkedin,
    medium: program.medium,
    dribbble: program.dribbble
  };

  await populateConfig(opts);
  updateHTML(("%s", username), opts);
}

//module.exports = {
//  buildCommand,
//  populateCSS,
//  populateConfig
//};
