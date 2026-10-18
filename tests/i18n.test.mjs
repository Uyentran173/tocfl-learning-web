import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const locales = ['en', 'zh-CN', 'zh-TW'];
const parse = (file) => ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
const catalogs = locales.map(() => new Map());
for (const file of ['lib/i18n.ts', 'lib/i18n-extra.ts', 'lib/i18n-vocabulary.ts']) {
  const source = parse(file);
  const visit = (node) => {
    if (ts.isPropertyAssignment(node) && (ts.isStringLiteral(node.name) || ts.isIdentifier(node.name)) && locales.includes(node.name.text) && ts.isObjectLiteralExpression(node.initializer)) {
      const catalog = catalogs[locales.indexOf(node.name.text)];
      for (const entry of node.initializer.properties) {
        if (!ts.isPropertyAssignment(entry) || !ts.isStringLiteral(entry.name) || !ts.isStringLiteral(entry.initializer)) continue;
        assert.ok(!catalog.has(entry.name.text), `Duplicate key ${entry.name.text} in ${node.name.text}`);
        catalog.set(entry.name.text, entry.initializer.text);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}
function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(path.join(dir, entry.name)) : entry.name.endsWith('.tsx') ? [path.join(dir, entry.name)] : []); }
const used = new Map();
for (const file of [...files('app'), ...files('components')]) {
  const source = parse(file);
  const visit = (node) => {
    let key;
    if (ts.isCallExpression(node) && node.expression.getText(source) === 't' && ts.isStringLiteral(node.arguments[0])) key = node.arguments[0].text;
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(source) === 'T') key = node.children.filter(ts.isJsxText).map((part) => part.text).join('').trim();
    if (key) used.set(key, file);
    ts.forEachChild(node, visit);
  };
  visit(source);
}
const i18nSource = parse('lib/i18n.ts');
const visitPageTitles = (node) => {
  if (ts.isVariableDeclaration(node) && node.name.getText(i18nSource) === 'pageTitleSources' && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
    for (const entry of node.initializer.properties) if (ts.isPropertyAssignment(entry) && ts.isStringLiteral(entry.initializer)) used.set(entry.initializer.text, 'lib/i18n.ts');
  }
  if (ts.isCallExpression(node) && node.expression.getText(i18nSource) === 'translate' && node.arguments[1] && ts.isStringLiteral(node.arguments[1])) used.set(node.arguments[1].text, 'lib/i18n.ts');
  ts.forEachChild(node, visitPageTitles);
};
visitPageTitles(i18nSource);
test('every static interface message has a translation in all four locales', () => {
  for (let i = 0; i < locales.length; i++) {
    const missing = [...used].filter(([key]) => !catalogs[i].has(key)).map(([key, file]) => `${key} (${file})`);
    assert.deepEqual(missing, [], `Missing ${locales[i]} translations`);
  }
});

test('interface locale does not determine exam script', () => {
  const source = fs.readFileSync('components/PreferencesProvider.tsx', 'utf8');
  assert.ok(!source.includes('examScript'));
  assert.ok(!source.includes('setScript'));
});
