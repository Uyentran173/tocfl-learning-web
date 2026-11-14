import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const sourceText = fs.readFileSync('lib/explore-content.ts', 'utf8');
const source = ts.createSourceFile('explore-content.ts', sourceText, ts.ScriptTarget.Latest, true);

function objectProperty(object, name) {
  const property = object.properties.find((item) => ts.isPropertyAssignment(item) && item.name.getText(source).replaceAll('"', '') === name);
  assert.ok(property, `Missing ${name}`);
  return property.initializer;
}

function exportedValue(name) {
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const declaration = statement.declarationList.declarations.find((item) => item.name.getText(source) === name);
    if (declaration) return ts.isAsExpression(declaration.initializer) ? declaration.initializer.expression : declaration.initializer;
  }
  assert.fail(`Missing ${name}`);
}

test('Explore routes and guides point to existing pages', () => {
  const routes = exportedValue('exploreRoutes');
  const features = exportedValue('featureRoutes');
  assert.ok(ts.isArrayLiteralExpression(routes));
  assert.ok(ts.isArrayLiteralExpression(features));
  assert.equal(routes.elements.length, 4);
  assert.equal(features.elements.length, 8);
  for (const item of [...routes.elements, ...features.elements]) {
    const href = objectProperty(item, 'href');
    assert.ok(ts.isStringLiteral(href));
    assert.ok(fs.existsSync(`app${href.text}/page.tsx`), `${href.text} has no page`);
  }
});

test('all four Explore locales cover every feature and FAQ category', () => {
  const content = exportedValue('exploreContent');
  const requiredCategories = ['start', 'academy', 'tocfl', 'account'];
  for (const locale of ['vi', 'en', 'zh-CN', 'zh-TW']) {
    const localized = objectProperty(content, locale);
    const features = objectProperty(objectProperty(localized, 'guide'), 'features');
    assert.equal(features.elements.length, 8, `${locale} feature count`);
    for (const feature of features.elements) {
      assert.equal(objectProperty(feature, 'steps').elements.length, 3, `${locale} walkthrough steps`);
    }
    const faq = objectProperty(localized, 'faq');
    const items = objectProperty(faq, 'items');
    assert.equal(items.elements.length, 13, `${locale} FAQ count`);
    const categories = new Set(items.elements.map((item) => objectProperty(item, 'category').text));
    assert.deepEqual([...categories].sort(), requiredCategories.sort());
  }
});
