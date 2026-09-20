import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export function createPrompt() {
  return createInterface({ input, output });
}

export async function ask(rl, question, fallback) {
  const hint = fallback === undefined || fallback === '' ? '' : ` (${fallback})`;
  const answer = (await rl.question(`${question}${hint}: `)).trim();
  return answer || fallback;
}

export async function confirm(rl, question, fallback = true) {
  const hint = fallback ? 'Y/n' : 'y/N';
  const answer = (await rl.question(`${question} [${hint}]: `)).trim().toLowerCase();
  if (!answer) return fallback;
  return answer === 'y' || answer === 'yes';
}

export async function choose(rl, question, options, fallback) {
  const labels = options.map((item, index) => `  ${index + 1}) ${item}`).join('\n');
  const answer = (await rl.question(`${question}\n${labels}\nChoice (${fallback}): `)).trim();
  if (!answer) return fallback;
  const asNum = Number(answer);
  if (Number.isInteger(asNum) && asNum >= 1 && asNum <= options.length) {
    return options[asNum - 1];
  }
  const match = options.find((item) => item.toLowerCase() === answer.toLowerCase());
  return match || fallback;
}
