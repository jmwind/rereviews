import { Button, Stack, ResourceItem, Page, Card, ResourceList, Avatar, TextStyle, Thumbnail, IndexTable, Badge } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import { useQuery, useMutation } from 'react-apollo';
import gql from 'graphql-tag';

const GET_PRODUCTS_BY_ID = gql`
  {
    products(first:10) {
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
          variants(first:1) {
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
      metafields:
        [{
          namespace: "rereviews",
          key: uuidv4,
          value: value,
          valueType: "JSON_STRING"}
        ]
      }
    }
  };
}

const createDeleteMetafieldInput = (id) => {
  return {
    variables: {
      input: {
        id: id
      }
    }
  };
}

const Index = () => {
  const { loading, error, data, refetch } = useQuery(GET_PRODUCTS_BY_ID);
  const [operationRunning, setOperationRunning] = useState(false);
  const [addPublicMetafield,  { mutationData }] = useMutation(ADD_METAFIELDS_BY_ID, {
    onCompleted: () => {
      refetch();
      setOperationRunning(false);
    }
  });
  const [removePublicMetafield, { deleteMutationData }] = useMutation(DELETE_METAFIELD_BY_ID, {
    onCompleted: () => {
      refetch();
      setOperationRunning(false);
    }
  });

  if(loading) return <div>Loading...</div>;
  if(error) return <div>Error {error.message}</div>;

  const resourceName = {
    singular: 'review',
    plural: 'reviews',
  };

  const promotedBulkActions = [
    {
      content: 'Approve',
      onAction: () => console.log('Todo: implement bulk edit'),
    },
    {
      content: 'Demote',
      onAction: () => console.log('Todo: implement bulk edit'),
    },
    {
      content: 'Delete',
      onAction: () => console.log('Todo: implement bulk edit'),
    },
  ];

  const renderItem =(item) => {
    const media = <Thumbnail alt="pic" source={item.node.featuredImage ? item.node.featuredImage.originalSrc : "https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg"} />;
    return item.node.metafields.edges.map((edge) => {
      return (
        <ResourceItem
        id={edge.node.id}
        media={media}
        accessibilityLabel={`View details for ${edge.node.id}`}
        >
          <Stack>
          <Stack.Item fill>
            <h3>
            <TextStyle variation="strong">3/5</TextStyle>
            </h3>
            <div>{edge.node.value}</div>
          </Stack.Item>
          <Stack.Item>
            <Badge status="success">Published</Badge>
          </Stack.Item>
          <Stack.Item>
            <Button onClick={() => {
              setOperationRunning(true);
              addPublicMetafield(
                createMetafieldInput(
                item.node.id,
                JSON.stringify(
                  {name:"nadine", email:"email", review:"this was a great product"}
                )))}
              }>Clone review</Button>
              <Button onClick={() => {
                setOperationRunning(true);
                removePublicMetafield(
                  createDeleteMetafieldInput(edge.node.id));
                }
              }>Delete review</Button>
            </Stack.Item>
          </Stack>
      </ResourceItem>
      )
    });
  }

  return (
    <Page>
      <TitleBar
        title="ReReviews"
        primaryAction={{
          content: 'Delete All Reviews',
          onAction: () => addPublicMetafield(createMetafieldInput("gid://shopify/Product/6586388578386", "some review that no one created"))
        }}
      />
      <Card>
        <ResourceList
          resourceName={resourceName}
          items={data.products.edges}
          renderItem={renderItem}
          loading={operationRunning}
        />
      </Card>
    </Page>
  )
}

export default Index;
