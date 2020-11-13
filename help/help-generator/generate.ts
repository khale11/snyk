import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

const COMMANDS: Record<string, { optionsFile?: string }> = {
  auth: {},
  test: {
    optionsFile: '_SNYK_COMMAND_OPTIONS',
  },
  monitor: {
    optionsFile: '_SNYK_COMMAND_OPTIONS',
  },
  container: {},
  iac: {},
  config: {},
  protect: {},
  policy: {},
  ignore: {},
  wizard: {},
  help: {},
  woof: {},
};

const GENERATED_MARKDOWN_FOLDER = './help/commands-md';
const GENERATED_MAN_FOLDER = './help/commands-man';
const GENERATED_TXT_FOLDER = './help/commands-txt';

function execShellCommand(cmd) {
  console.log('execShellCommand -> cmd', cmd);
  return new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      return resolve(stdout ? stdout : stderr);
    });
  });
}

async function generateRoff(outputDir, inputFile) {
  return await execShellCommand(
    `ronn --roff -o ${outputDir} ${inputFile} --organization=Snyk.io`,
  );
}

async function printRoff(inputFile) {
  return await execShellCommand(`MANWIDTH=80 man ${inputFile}`);
}

async function processMarkdown(markdownDoc, commandName) {
  const markdownFilePath = `${GENERATED_MARKDOWN_FOLDER}/snyk-${commandName}.md`;
  const txtFilePath = `${GENERATED_TXT_FOLDER}/snyk-${commandName}.txt`;

  fs.writeFileSync(markdownFilePath, markdownDoc);

  await generateRoff(GENERATED_MAN_FOLDER, markdownFilePath);
  const roff = (await printRoff(
    `${GENERATED_MAN_FOLDER}/snyk-${commandName}.1`,
  )) as string;

  const res = roff
    .replace(/(.)[\b](.)/gi, (match, firstChar, actualletter) => {
      if (firstChar === '_' && actualletter !== '_') {
        return `\x1b[4m${actualletter}\x1b[0m`;
      }
      return `\x1b[1m${actualletter}\x1b[0m`;
    })
    .split('\n')
    .slice(4, -4)
    .join('\n');
  console.log(res);

  fs.writeFileSync(txtFilePath, res);
}

async function run() {
  // Ensure folders exists
  [
    GENERATED_MAN_FOLDER,
    GENERATED_MARKDOWN_FOLDER,
    GENERATED_TXT_FOLDER,
  ].forEach((path) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  });

  const getMdFilePath = (filename: string) =>
    path.resolve(__dirname, `./../commands-docs/${filename}.md`);

  const readFile = (filename: string) =>
    fs.readFileSync(getMdFilePath(filename), 'utf8');

  const readFileIfExists = (filename: string) =>
    fs.existsSync(getMdFilePath(filename)) ? readFile(filename) : '';

  const _snykHeader = readFile('_SNYK_COMMAND_HEADER');
  const _snykOptions = readFile('_SNYK_COMMAND_OPTIONS');
  const _snykGlobalOptions = readFile('_SNYK_GLOBAL_OPTIONS');
  const _environment = readFile('_ENVIRONMENT');
  const _examples = readFile('_EXAMPLES');
  const _exitCodes = readFile('_EXIT_CODES');
  const _notices = readFile('_NOTICES');

  for (const [name, { optionsFile }] of Object.entries(COMMANDS)) {
    console.info(`Generating snyk-${name}.md`);
    const commandDoc = readFile(name);

    // Piece together a help file for each command
    const doc = `${commandDoc}

${optionsFile ? readFileIfExists(optionsFile) : ''}

${_snykGlobalOptions}

${readFileIfExists(`${name}-examples`)}

${_exitCodes}

${_environment}

${_notices}
  `;

    await processMarkdown(doc, name);
  }

  // This just slaps strings together for the global snyk help doc
  const globalDoc = `${_snykHeader}

${_snykOptions}
${_snykGlobalOptions}

${_examples}

${_exitCodes}

${_environment}

${_notices}
  `;
  await processMarkdown(globalDoc, 'snyk');
}
run();
