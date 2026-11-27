// Validates a template manifest (webcraft-template.json) against schemas/template-manifest.schema.json.
// No dependencies: implements the JSON Schema keywords that schema uses (type, const, enum, pattern,
// minLength, minItems, required, properties, additionalProperties: false, items, $ref to #/$defs).
// Usage: node scripts/template/validate-manifest.mjs <template-folder-or-manifest.json>
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const schemaPath = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "schemas", "template-manifest.schema.json");
export const MANIFEST = "webcraft-template.json";

const typeOf = (v) => (Array.isArray(v) ? "array" : v === null ? "null" : Number.isInteger(v) ? "integer" : typeof v);

export function validate(value, schema = JSON.parse(readFileSync(schemaPath, "utf8")), root = schema, path = "manifest") {
  const errors = [];
  if (schema.$ref) {
    const target = schema.$ref.replace(/^#\//, "").split("/").reduce((o, k) => o[k], root);
    return validate(value, target, root, path);
  }
  if ("const" in schema && value !== schema.const) errors.push(`${path} must be ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path} must be one of ${schema.enum.join(", ")}`);
  if (schema.type) {
    const t = typeOf(value);
    const ok = schema.type === t || (schema.type === "number" && t === "integer");
    if (!ok) { errors.push(`${path} must be ${schema.type}, got ${t}`); return errors; }
  }
  if (typeof value === "string") {
    if (schema.minLength && value.length < schema.minLength) errors.push(`${path} is shorter than ${schema.minLength} characters`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${path} "${value}" does not match ${schema.pattern}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) errors.push(`${path} needs at least ${schema.minItems} item(s)`);
    if (schema.items) value.forEach((v, i) => errors.push(...validate(v, schema.items, root, `${path}[${i}]`)));
  }
  if (typeOf(value) === "object") {
    for (const k of schema.required || []) if (!(k in value)) errors.push(`${path}.${k} is required`);
    for (const [k, v] of Object.entries(value)) {
      if (schema.properties && k in schema.properties) errors.push(...validate(v, schema.properties[k], root, `${path}.${k}`));
      else if (schema.additionalProperties === false) errors.push(`${path}.${k} is not an allowed property`);
    }
  }
  return errors;
}

export function loadManifest(target) {
  const file = existsSync(target) && statSync(target).isDirectory() ? join(target, MANIFEST) : target;
  if (!existsSync(file)) return { file, manifest: null, errors: [`${file} not found`] };
  let manifest;
  try { manifest = JSON.parse(readFileSync(file, "utf8")); } catch (e) { return { file, manifest: null, errors: [`${file} is not valid JSON: ${e.message}`] }; }
  return { file, manifest, errors: validate(manifest) };
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const target = process.argv[2];
  if (!target) { console.error("Usage: node scripts/template/validate-manifest.mjs <template-folder-or-manifest.json>"); process.exit(2); }
  const { file, errors } = loadManifest(target);
  for (const e of errors) console.log("ERROR " + e);
  console.log(errors.length ? `FAIL: ${file} has ${errors.length} problem(s)` : `PASS: ${file} matches schema 1.0`);
  process.exitCode = errors.length ? 1 : 0;
}
