import { GraphQLScalarType, Kind, ValueNode } from 'graphql';

function parseAst(ast: ValueNode): unknown {
  switch (ast.kind) {
    case Kind.NULL:
      return null;
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.STRING:
      return ast.value;
    case Kind.INT:
      return Number(ast.value);
    case Kind.FLOAT:
      return Number(ast.value);
    case Kind.LIST:
      return ast.values.map((v) => parseAst(v));
    case Kind.OBJECT:
      return Object.fromEntries(ast.fields.map((f) => [f.name.value, parseAst(f.value)]));
    default:
      return null;
  }
}

export const resolvers: Record<string, unknown> = {
  JSON: new GraphQLScalarType({
    name: 'JSON',
    description: 'Arbitrary JSON value',
    serialize: (value: unknown): unknown => value,
    parseValue: (value: unknown): unknown => value,
    parseLiteral: (ast: ValueNode): unknown => parseAst(ast),
  }),
};
