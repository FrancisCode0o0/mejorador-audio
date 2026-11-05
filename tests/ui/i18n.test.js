// Language check of the CI (plan step F1.7): texts live only in web/i18n.js, every
// language has the same keys, and every key used by the code exists. Run: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { TEXTS } from "../../web/i18n.js";

const REFERENCE_LANGUAGE = "es";
const WEB_DIRECTORY = new URL("../../web/", import.meta.url);
// A string literal that looks like a text key: lowercase word, a dot, a camelCase word.
const KEY_LITERAL_PATTERN = /(["'`])([a-z]+\.[A-Za-z]+)\1/g;
const IMPORT_OF_I18N_PATTERN = /(?:from|import)\s*\(?\s*["'][^"']*i18n/;

function readWebFile(relativePath) {
  return readFileSync(new URL(relativePath, WEB_DIRECTORY), "utf8");
}

function javascriptFilesIn(relativeDirectory) {
  const directory = new URL(relativeDirectory, WEB_DIRECTORY);
  return readdirSync(directory)
    .filter((fileName) => fileName.endsWith(".js"))
    .map((fileName) => `${relativeDirectory}${fileName}`);
}

test("every language in TEXTS has exactly the keys of 'es', because a missing key would show the raw key to that language's users; exact set comparison, no tolerance", () => {
  const referenceKeys = Object.keys(TEXTS[REFERENCE_LANGUAGE]).sort();
  for (const [language, texts] of Object.entries(TEXTS)) {
    assert.deepEqual(Object.keys(texts).sort(), referenceKeys, `language "${language}"`);
  }
});

test("every string literal in web/ui/*.js that looks like a key (prefix known in TEXTS) exists in TEXTS.es, because t() would otherwise show the raw key; exact lookup", () => {
  const referenceTexts = TEXTS[REFERENCE_LANGUAGE];
  const keyPrefixes = new Set(Object.keys(referenceTexts).map((key) => key.split(".")[0]));
  let checkedKeyCount = 0;
  for (const filePath of javascriptFilesIn("ui/")) {
    for (const match of readWebFile(filePath).matchAll(KEY_LITERAL_PATTERN)) {
      const key = match[2];
      if (!keyPrefixes.has(key.split(".")[0])) continue;
      assert.ok(key in referenceTexts, `${filePath}: unknown text key "${key}"`);
      checkedKeyCount += 1;
    }
  }
  // Guards the test itself: if the pattern stopped matching, it would pass with nothing checked.
  assert.ok(checkedKeyCount > 0, "no text key found in web/ui/*.js");
});

test("web/index.html has no visible text between tags once comments, <style> and <script> are removed, because every visible text must come from i18n.js", () => {
  const markup = readWebFile("index.html")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<!doctype[^>]*>/i, "");
  const visibleTexts = [...markup.matchAll(/>([^<]*)</g)]
    .map((match) => match[1].trim())
    .filter((text) => text !== "");
  assert.deepEqual(visibleTexts, []);
});

test("no file in web/dsp/ or web/io/ imports i18n.js, because only ui/ may use texts (docs/style.md)", () => {
  for (const directory of ["dsp/", "io/"]) {
    for (const filePath of javascriptFilesIn(directory)) {
      assert.doesNotMatch(readWebFile(filePath), IMPORT_OF_I18N_PATTERN, filePath);
    }
  }
});
