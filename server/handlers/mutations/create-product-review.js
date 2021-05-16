import "isomorphic-fetch";
import { gql } from "apollo-boost";

export function CREATE_PRIVATE_METAFIELD(url) {
  return gql`
    mutation($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          privateMetafields(namespace: "rereviews", first: 10) {
            edges {
              node {
                id
                namespace
                key
                value
              }
            }
          }
        }
      }
    }
  `;
}

export const createProductReview = async (ctx) => {
  const { client } = ctx;
  const confirmationUrl = await client
    .mutate({
      mutation: CREATE_PRIVATE_METAFIELD(process.env.HOST),
    })
    .then((response) => response.data.appPurchaseOneTimeCreate.confirmationUrl);
  return ctx.redirect(confirmationUrl);
};
