import { Button, Heading, Page, Card, ResourceList, Avatar, TextStyle, Thumbnail, IndexTable, Badge } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { Query, useQuery, useMutation } from 'react-apollo';
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

const Metafields = (props) => {
  return (
        {fieldsList}
  )
}

const Index = () => {
  const { loading, error, data } = useQuery(GET_PRODUCTS_BY_ID);
  const [addPublicMetafield,  { mutationData }] = useMutation(ADD_METAFIELDS_BY_ID);

  if(loading) return <div>Loading...</div>;
  if(error) return <div>Error {error.message}</div>;

  const metafieldList = data.products.edges.map((item) => {
    const media = <Thumbnail alt="pic" source={item.node.featuredImage ? item.node.featuredImage.originalSrc : "https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg"} />;
    return item.node.metafields.edges.map((edge) => {
      return (
        <IndexTable.Row
          id={edge.node.id}
          key={edge.node.id}
        >
          <IndexTable.Cell>
            {media}
          </IndexTable.Cell>
          <IndexTable.Cell>5</IndexTable.Cell>
          <IndexTable.Cell>Dec 15, 2021</IndexTable.Cell>
          <IndexTable.Cell>{edge.node.value}</IndexTable.Cell>
          <IndexTable.Cell>
            <Badge status="success">Published</Badge>
            <Button onClick={() => {
              addPublicMetafield(
                createMetafieldInput(
                item.node.id,
                JSON.stringify(
                  {name:"nadine", email:"email", review:"this was a great product"}
                )))}
              }>Add review</Button>
          </IndexTable.Cell>
        </IndexTable.Row>
      )
    });
  });

  console.log(data);

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
        <IndexTable
          resourceName={resourceName}
          itemCount={10}
          loading={loading}
          promotedBulkActions={promotedBulkActions}
          selectedItemsCount={'All'}
          headings={[
            {title: 'Product'},
            {title: 'Rating'},
            {title: 'Date'},
            {title: 'Content'},
            {title: 'Status'},
          ]}
        >
          {metafieldList}
        </IndexTable>
      </Card>
    </Page>
  )
}

export default Index;
