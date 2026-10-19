import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(root, 'docs', 'diagrams', 'generated');
const checkOnly = process.argv.includes('--check');

async function sourceFile(relativePath) {
  const filePath = path.join(root, relativePath);
  const text = await readFile(filePath, 'utf8');
  return {
    text,
    source: ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true),
  };
}

function unwrap(expression) {
  while (
    ts.isAsExpression(expression) ||
    ts.isSatisfiesExpression(expression) ||
    ts.isParenthesizedExpression(expression)
  ) {
    expression = expression.expression;
  }
  return expression;
}

function findConstant(source, name) {
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === name &&
        declaration.initializer
      ) {
        return unwrap(declaration.initializer);
      }
    }
  }
  throw new Error(`Could not find initialized constant ${name}.`);
}

function objectValues(object) {
  if (!ts.isObjectLiteralExpression(object)) {
    throw new Error('Expected an object literal while generating diagrams.');
  }
  return new Map(
    object.properties
      .filter(ts.isPropertyAssignment)
      .map((property) => [
        property.name.getText().replaceAll(/['"]/g, ''),
        unwrap(property.initializer),
      ]),
  );
}

function stringValue(expression) {
  if (
    !ts.isStringLiteral(expression) &&
    !ts.isNoSubstitutionTemplateLiteral(expression)
  ) {
    throw new Error(`Expected a string literal, got ${expression.getText()}.`);
  }
  return expression.text;
}

function arrayObjects(expression) {
  if (!ts.isArrayLiteralExpression(expression)) {
    throw new Error('Expected an array literal while generating diagrams.');
  }
  return expression.elements.map(objectValues);
}

function valueFrom(values, key, fallback = undefined) {
  const expression = values.get(key);
  return expression === undefined ? fallback : stringValue(expression);
}

function mapUmlType(type, className, memberName) {
  if (!type) return 'void';
  if (type === 'string') return 'String';
  if (type === 'number') {
    if (className === 'Station' && memberName === 'capacity') return 'int';
    if (className === 'Bike' && memberName === 'batteryLevel') return 'int';
    if (className === 'Rental' && memberName === 'cost') return 'double';
  }
  return type;
}

function renderClassDiagram(model) {
  const declarations = model.source.statements.flatMap((statement) =>
    ts.isClassDeclaration(statement) && statement.name ? [statement] : [],
  );
  const classes = declarations.map((classDeclaration) => {
    const className = classDeclaration.name.text;
    const members = classDeclaration.members.flatMap((member) => {
      if (
        ts.isPropertyDeclaration(member) &&
        ts.isIdentifier(member.name) &&
        member.type
      ) {
        const name = member.name.text;
        return [
          `        +${mapUmlType(member.type.getText(model.source), className, name)} ${name}`,
        ];
      }
      if (ts.isMethodDeclaration(member) && ts.isIdentifier(member.name)) {
        const name = member.name.text;
        const parameters = member.parameters.map((parameter) => {
          if (!ts.isIdentifier(parameter.name)) {
            throw new Error(`Unsupported parameter declaration in ${className}.${name}.`);
          }
          const parameterName = parameter.name.text;
          const type = mapUmlType(
            parameter.type?.getText(model.source),
            className,
            parameterName,
          );
          return `${parameterName}: ${type}`;
        });
        const returnType = mapUmlType(
          member.type?.getText(model.source),
          className,
          name,
        );
        return [`        +${name}(${parameters.join(', ')}) ${returnType}`];
      }
      return [];
    });
    return `    class ${className} {\n${members.join('\n')}\n    }`;
  });

  const relationshipExpression = findConstant(model.source, 'domainRelationships');
  const relationships = arrayObjects(relationshipExpression).map((values) => {
    const source = valueFrom(values, 'source');
    const target = valueFrom(values, 'target');
    const sourceMultiplicity = valueFrom(values, 'sourceMultiplicity');
    const targetMultiplicity = valueFrom(values, 'targetMultiplicity');
    const label = valueFrom(values, 'label');
    const kind = valueFrom(values, 'kind');
    const arrow = kind === 'aggregation' ? 'o--' : '-->';
    return `    ${source} "${sourceMultiplicity}" ${arrow} "${targetMultiplicity}" ${target} : ${label}`;
  });

  return `classDiagram\n${classes.join('\n')}\n\n${relationships.join('\n')}\n`;
}

function renderStateDiagram(stateMachine) {
  const initial = objectValues(
    findConstant(stateMachine.source, 'INITIAL_BIKE_TRANSITION'),
  );
  const initialState = valueFrom(initial, 'to');
  const transitionObjects = arrayObjects(
    findConstant(stateMachine.source, 'BIKE_STATE_TRANSITIONS'),
  );
  const transitions = transitionObjects.map((values) => {
    const id = valueFrom(values, 'id');
    const from = valueFrom(values, 'from');
    const to = valueFrom(values, 'to');
    const trigger = valueFrom(values, 'trigger');
    const detail = valueFrom(values, 'detail');
    const guard = valueFrom(values, 'guard');
    const text = [trigger, detail].filter(Boolean).join(' ');
    const guardText = guard ? ` [${guard}]` : '';
    return `    ${from} --> ${to} : ${text}${guardText} / ${id}`;
  });
  return `stateDiagram-v2\n    [*] --> ${initialState} : ${valueFrom(initial, 'id')}\n${transitions.join('\n')}\n`;
}

function renderSequenceDiagram(source, participantsConstant, messagesConstant) {
  const participants = findConstant(source.source, participantsConstant);
  if (!ts.isArrayLiteralExpression(participants)) {
    throw new Error(`Expected ${participantsConstant} to be an array.`);
  }
  const participantLines = participants.elements.map(
    (participant) => `    participant ${stringValue(participant)}`,
  );
  const messageObjects = arrayObjects(findConstant(source.source, messagesConstant));
  const messages = messageObjects.map((values) => {
    const id = valueFrom(values, 'id');
    const from = valueFrom(values, 'from');
    const to = valueFrom(values, 'to');
    const message = valueFrom(values, 'message');
    const response =
      message === 'Available' ||
      message === 'rental started' ||
      message === 'docked' ||
      message === 'paid' ||
      message === 'cost + receipt' ||
      message === 'unlocked, ride started' ||
      message === 'show receipt';
    const arrow = response ? '-->>' : '->>';
    return `    ${from}${arrow}${to}: ${message} (${id})`;
  });
  return `sequenceDiagram\n    actor User\n${participantLines.join('\n')}\n${messages.join('\n')}\n`;
}

function renderUseCaseDiagram() {
  return `%% Derived from code, no ground truth.\nflowchart LR\n    user((User)) --> rent[Rent a bike]\n    user --> return[Return a bike]\n    return --> receipt[View receipt]\n    user --> reload[Reload page]\n    reload --> seed[Restore seeded data]\n`;
}

function renderActivityDiagram(rentFlow, returnFlow) {
  function activitySteps(source, messagesConstant) {
    const messages = arrayObjects(findConstant(source.source, messagesConstant));
    return messages.map((values, index) => {
      const id = valueFrom(values, 'id');
      const message = valueFrom(values, 'message');
      const next =
        index + 1 < messages.length
          ? ` --> ${messagesConstant === 'RENT_MESSAGE_SEQUENCE' ? 'rent' : 'return'}${index + 2}`
          : '';
      const prefix =
        index === 0
          ? `    ${messagesConstant === 'RENT_MESSAGE_SEQUENCE' ? 'start' : 'rent8'} --> `
          : '    ';
      return `${prefix}${messagesConstant === 'RENT_MESSAGE_SEQUENCE' ? 'rent' : 'return'}${index + 1}["${id}: ${message}"]${next}`;
    });
  }
  const rentSteps = activitySteps(rentFlow, 'RENT_MESSAGE_SEQUENCE');
  const returnSteps = activitySteps(returnFlow, 'RETURN_MESSAGE_SEQUENCE');
  return `%% Derived from code, no ground truth.\nflowchart TD\n    start((Start))\n${rentSteps.join('\n')}\n${returnSteps.join('\n')}\n    return9 --> finish((End))\n    reload((Reload page)) --> seed[Create fresh seeded mock state]\n`;
}

async function writeDiagram(fileName, contents) {
  const filePath = path.join(outputDirectory, fileName);
  if (checkOnly) {
    const existing = await readFile(filePath, 'utf8');
    if (existing !== contents) {
      throw new Error(
        `${path.relative(root, filePath)} is out of date; run npm run diagrams:generate.`,
      );
    }
    return;
  }
  await writeFile(filePath, contents, 'utf8');
}

const [model, stateMachine, rentFlow, returnFlow] = await Promise.all([
  sourceFile('src/domain/model.ts'),
  sourceFile('src/domain/stateMachine.ts'),
  sourceFile('src/application/rentBike.ts'),
  sourceFile('src/application/returnBike.ts'),
]);

await Promise.all([
  writeDiagram('class.mmd', renderClassDiagram(model)),
  writeDiagram('state.mmd', renderStateDiagram(stateMachine)),
  writeDiagram(
    'rent-sequence.mmd',
    renderSequenceDiagram(rentFlow, 'RENT_PARTICIPANTS', 'RENT_MESSAGE_SEQUENCE'),
  ),
  writeDiagram(
    'return-sequence.mmd',
    renderSequenceDiagram(returnFlow, 'RETURN_PARTICIPANTS', 'RETURN_MESSAGE_SEQUENCE'),
  ),
  writeDiagram('use-case.mmd', renderUseCaseDiagram()),
  writeDiagram('activity.mmd', renderActivityDiagram(rentFlow, returnFlow)),
]);

console.log(
  checkOnly
    ? 'Generated diagrams match implementation sources.'
    : 'Generated diagrams from implementation sources.',
);
