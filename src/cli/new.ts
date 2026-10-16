import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** `planpage new <name>` — scaffold a template folder (component + test + README) per the recipe. */
export const newCommand = (name: string): void => {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) {
    throw new Error("template name must be kebab-case, starting with a letter");
  }
  const pascal = toPascal(name);
  const parent = join("src", "templates");
  const directory = join(parent, pascal);
  if (existsSync(directory)) throw new Error(`template ${pascal} already exists`);
  mkdirSync(parent, { recursive: true });
  mkdirSync(directory);
  const files = [
    { name: `${pascal}.tsx`, content: componentStub(pascal) },
    { name: `${pascal}.test.tsx`, content: testStub(pascal) },
    { name: "README.md", content: `# ${pascal}\n\nWhat it renders + an example JSON input.\n` },
  ];
  try {
    for (const file of files) {
      const destination = join(directory, file.name);
      writeFileSync(destination, file.content, { flag: "wx" });
    }
  } catch (error) {
    rmSync(directory, { recursive: true, force: true });
    throw error;
  }
  process.stdout.write(
    `planpage: scaffolded ${directory}/ — register it in src/templates/index.tsx\n`,
  );
};

const toPascal = (name: string): string => {
  return name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
};

const componentStub = (name: string): string => {
  return `import { SectionCard } from "../../components/SectionCard";

export interface ${name}Props {
  readonly title: string;
}

export const ${name} = ({ title }: ${name}Props) => {
  if (!title) throw new Error("${name}: title is required");
  return (
    <SectionCard title={title} chip="new">
      {/* compose components here */}
    </SectionCard>
  );
};
`;
};

const testStub = (name: string): string => {
  return `import { describe, expect, it } from "vitest";
import { render } from "../../render/render";
import { ${name} } from "./${name}";

describe("${name}", () => {
  it("renders the title", () => {
    const html = render(<${name} title="Hi" />);
    expect(html).toContain("Hi");
  });
  it("escapes the title", () => {
    const html = render(<${name} title={"<img src=x>"} />);
    expect(html).toContain("&lt;img");
  });
  it("requires a title", () => {
    expect(() => render(<${name} title="" />)).toThrow(/title is required/);
  });
});
`;
};
