import { ObjectId } from 'mongodb';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import _ from 'lodash';
import userResolvers from './Users';

const resolvers = {};

_.merge(resolvers, userResolvers);

resolvers.ObjID = new GraphQLScalarType({
  name: 'ObjID',
  description: 'Id String representation, based on Mongo Object Ids',
  parseValue(value) {
    return ObjectId(value);
  },
  serialize(value) {
    return value.toString();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ObjectId(ast.value);
    }
    return null;
  }
});

resolvers.Date = new GraphQLScalarType({
  name: 'Date',
  description: 'A Date object',
  parseValue(value) {
    return new Date(value);
  },
  serialize(value) {
    return value.getTime();
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.INT:
      case Kind.FLOAT:
        return new Date(parseFloat(ast.value));
      default:
        return null;
    }
  }
});

function parseLiteral(ast) {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT: {
      const value = Object.create(null);
      ast.fields.forEach(field => {
        value[field.name.value] = parseLiteral(field.value);
      });

      return value;
    }
    case Kind.LIST:
      return ast.values.map(parseLiteral);
    default:
      return null;
  }
}

resolvers.JSON = new GraphQLScalarType({
  name: 'JSON',
  description: 'A JSON object',
  parseValue(value) {
    return value;
  },
  serialize(value) {
    return value;
  },
  parseLiteral
});

export default resolvers;
