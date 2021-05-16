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
  }
`;

const ADD_METAFIELDS_BY_ID = gql`
  mutation($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
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

const ADD_PRIVATE_METAFIELDS_BY_ID = gql`
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

const DELETE_PRIVATE_METAFIELD_BY_ID = gql`
  mutation privateMetafieldDelete($input: PrivateMetafieldDeleteInput!) {
    privateMetafieldDelete(input: $input) {
      deletedPrivateMetafieldId
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

const createPrivateMetafieldInput = (id, value) => {
  const uuidv4 = Math.random().toString(36).substring(7);
  return {
    variables: {
      input: {
        id: id,
        privateMetafields: [
          {
            namespace: "rereviews",
            key: uuidv4,
            valueInput: {
              value: value,
              valueType: "JSON_STRING",
            },
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

const createDeletePrivateMetafieldInput = (id, namespace, key) => {
  return {
    variables: {
      input: {
        owner: id,
        key: key,
        namespace: namespace,
      },
    },
  };
};

export {
  GET_PRODUCTS,
  ADD_METAFIELDS_BY_ID,
  DELETE_METAFIELD_BY_ID,
  ADD_PRIVATE_METAFIELDS_BY_ID,
  DELETE_PRIVATE_METAFIELD_BY_ID,
  createMetafieldInput,
  createPrivateMetafieldInput,
  createDeleteMetafieldInput,
  createDeletePrivateMetafieldInput,
};
