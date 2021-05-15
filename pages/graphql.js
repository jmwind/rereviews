import gql from "graphql-tag";

const GET_PRODUCTS = gql`
  {
    products(first: 10) {
      edges {
        node {
          id
          title
          description
          featuredImage {
            id
            originalSrc
          }
          metafields(namespace: "rereviews", first: 10) {
            edges {
              node {
                id
                namespace
                key
                value
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                image {
                  src
                }
              }
            }
          }
        }
      }
    }
  }
`;

const ADD_METAFIELDS_BY_ID = gql`
  mutation($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        metafields(first: 10) {
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

const DELETE_METAFIELD_BY_ID = gql`
  mutation metafieldDelete($input: MetafieldDeleteInput!) {
    metafieldDelete(input: $input) {
      deletedId
      userErrors {
        field
        message
      }
    }
  }
`;

const createMetafieldInput = (id, value) => {
  const uuidv4 = Math.random().toString(36).substring(7);
  return {
    variables: {
      input: {
        id: id,
        metafields: [
          {
            namespace: "rereviews",
            key: uuidv4,
            value: value,
            valueType: "JSON_STRING",
          },
        ],
      },
    },
  };
};

const createDeleteMetafieldInput = (id) => {
  return {
    variables: {
      input: {
        id: id,
      },
    },
  };
};

export {
  GET_PRODUCTS,
  ADD_METAFIELDS_BY_ID,
  DELETE_METAFIELD_BY_ID,
  createMetafieldInput,
  createDeleteMetafieldInput,
};
