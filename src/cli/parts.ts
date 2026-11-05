import type { SketchPart } from "../contracts/sketchScene";
import { SKETCH_PARTS } from "../sketchParts/sketchParts";

export interface PartsCommandOptions {
  readonly json?: boolean;
}

const EXIT_CODE_OK = 0;
const EXIT_CODE_BAD_USAGE = 2;

const findPartByClassName = (className: string): SketchPart | null =>
  SKETCH_PARTS.find((part) => part.className === className) ?? null;

const printPartListJson = (): number => {
  const partSummaries = SKETCH_PARTS.map((part) => ({
    className: part.className,
    group: part.group,
    useFor: part.useFor,
  }));
  process.stdout.write(`${JSON.stringify({ parts: partSummaries }, null, 2)}\n`);
  return EXIT_CODE_OK;
};

const printPartListLines = (): number => {
  const classNameWidth = Math.max(...SKETCH_PARTS.map((part) => part.className.length));
  const groupWidth = Math.max(...SKETCH_PARTS.map((part) => part.group.length));
  for (const part of SKETCH_PARTS) {
    const line = `${part.className.padEnd(classNameWidth)}  ${part.group.padEnd(groupWidth)}  ${part.useFor}`;
    process.stdout.write(`${line}\n`);
  }
  return EXIT_CODE_OK;
};

const reportUnknownPart = (className: string): number => {
  process.stderr.write(
    `planpage: unknown part "${className}". Run planpage parts to list the class names.\n`,
  );
  return EXIT_CODE_BAD_USAGE;
};

const printPartJson = (part: SketchPart): number => {
  process.stdout.write(`${JSON.stringify(part, null, 2)}\n`);
  return EXIT_CODE_OK;
};

const printPartExamples = (part: SketchPart): number => {
  for (const example of part.examples) {
    process.stdout.write(`<!-- ${example.label} -->\n${example.html}\n`);
  }
  return EXIT_CODE_OK;
};

const printOnePart = (className: string, options: PartsCommandOptions): number => {
  const part = findPartByClassName(className);
  const isPartMissing = part === null;
  if (isPartMissing) return reportUnknownPart(className);

  const isJsonOutput = options.json === true || !process.stdout.isTTY;
  if (isJsonOutput) return printPartJson(part);

  return printPartExamples(part);
};

export const partsCommand = (
  className: string | undefined,
  options: PartsCommandOptions,
): number => {
  const isClassNameGiven = className !== undefined;
  if (isClassNameGiven) return printOnePart(className, options);

  const isJsonOutput = options.json === true || !process.stdout.isTTY;
  if (isJsonOutput) return printPartListJson();

  return printPartListLines();
};
