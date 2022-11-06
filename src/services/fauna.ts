import * as faunadb from "faunadb";

export const q = faunadb.query;

export const fauna = new faunadb.Client({ 
  secret: process.env.FAUNADB_SECRET as string,
  domain: process.env.FAUNADB_DOMAIN as string,
});