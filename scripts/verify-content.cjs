const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const contentPath = path.join(__dirname, '..', 'src', 'data', 'content.ts');
const source = fs.readFileSync(contentPath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const loaded = { exports: {} };
new Function('exports', 'module', 'require', compiled)(loaded.exports, loaded, require);

const { questions, entrepreneurs } = loaded.exports;
const ids = Object.keys(entrepreneurs);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(questions.length === 10, `Ожидалось 10 вопросов, получено: ${questions.length}`);
assert(ids.length === 8, `Ожидалось 8 результатов, получено: ${ids.length}`);

for (const [questionIndex, question] of questions.entries()) {
  assert(question.answers.length === 5, `В вопросе ${questionIndex + 1} должно быть 5 ответов`);
  assert(!/ваш(?:его|ему|им|ем|а|и)?\s+реб[её]нок/i.test(question.text), `Вопрос ${questionIndex + 1} обращён не к ребёнку`);

  for (const answer of question.answers) {
    assert(answer.text.trim().length > 0, `Пустой ответ в вопросе ${questionIndex + 1}`);
    for (const [id, points] of Object.entries(answer.points)) {
      assert(ids.includes(id), `Неизвестный результат ${id} в вопросе ${questionIndex + 1}`);
      assert(points === 1 || points === 2, `Недопустимый вес ${points} у результата ${id}`);
    }
  }
}

function winnerFor(scores) {
  let winner = 0;
  for (let index = 1; index < ids.length; index += 1) {
    if (scores[index] > scores[winner]) winner = index;
  }
  return winner;
}

for (const [targetIndex, targetId] of ids.entries()) {
  const scores = new Int16Array(ids.length);
  for (const question of questions) {
    const answer = question.answers.reduce((best, candidate) => (
      (candidate.points[targetId] || 0) > (best.points[targetId] || 0) ? candidate : best
    ), question.answers[0]);
    for (const [id, points] of Object.entries(answer.points)) scores[ids.indexOf(id)] += points;
  }
  assert(winnerFor(scores) === targetIndex, `Результат ${targetId} нельзя получить уверенным выбором профильных ответов`);
}

const vectors = questions.map((question) => question.answers.map((answer) => (
  ids.map((id) => answer.points[id] || 0)
)));
const outcomeCounts = new Array(ids.length).fill(0);
const scores = new Int16Array(ids.length);
let combinations = 0;

function enumerate(questionIndex) {
  if (questionIndex === vectors.length) {
    outcomeCounts[winnerFor(scores)] += 1;
    combinations += 1;
    return;
  }

  for (const vector of vectors[questionIndex]) {
    for (let index = 0; index < scores.length; index += 1) scores[index] += vector[index];
    enumerate(questionIndex + 1);
    for (let index = 0; index < scores.length; index += 1) scores[index] -= vector[index];
  }
}

enumerate(0);

const distribution = ids.map((id, index) => ({
  id,
  share: outcomeCounts[index] / combinations,
}));

for (const item of distribution) {
  assert(item.share >= 0.07, `Результат ${item.id} выпадает реже 7% комбинаций`);
  assert(item.share <= 0.20, `Результат ${item.id} выпадает чаще 20% комбинаций`);
}

console.log(`Контент проверен: ${questions.length} вопросов, ${ids.length} результатов, ${combinations.toLocaleString('ru-RU')} комбинаций.`);
console.log(distribution.map(({ id, share }) => `${id}: ${(share * 100).toFixed(2)}%`).join(' | '));
