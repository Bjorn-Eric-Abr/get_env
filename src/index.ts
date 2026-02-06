import { parseArgs } from "util";

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    environment: {
      type: "string",
      short: "e",
    },
  },
  strict: true,
  allowPositionals: true,
});

const keyToFind = positionals[0];
const envSuffix = values.environment;

if (!keyToFind) {
  console.error("Usage: get_env <KEY> [-e <environment>]");
  process.exit(1);
}

const filename = envSuffix ? `.env.${envSuffix}` : ".env";
const file = Bun.file(filename);

if (!(await file.exists())) {
  console.error(`Error: File '${filename}' not found.`);
  process.exit(1);
}

const content = await file.text();
const lines = content.split("\n");

let foundValue: string | null = null;

for (const line of lines) {
  const trimmed = line.trim();
  // Skip comments and empty lines
  if (!trimmed || trimmed.startsWith("#")) continue;

  const match = trimmed.match(/^([^=]+)=(.*)$/);
  if (match && match[1] !== undefined && match[2] !== undefined) {
    const key = match[1].trim();
    let value = match[2].trim();

    if (key === keyToFind) {
      // Remove surrounding quotes if present (simple handling)
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      foundValue = value;
      break;
    }
  }
}

if (foundValue !== null) {
  console.log(foundValue);
} else {
  process.exit(1);
}
