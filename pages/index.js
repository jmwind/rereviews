import { Heading, Page, Card, ResourceList, Avatar, TextStyle, Thumbnail } from "@shopify/polaris";
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

const Metafields = (props) => {
  let fieldsList = props.metafields.edges.map((edge) => {
    return (
      <div>
        {edge.node.namespace + ", " + edge.node.key}
        <div>{edge.node.value}</div>
      </div>
    )
  });

  return (
    <div>
    <h3>
      <TextStyle variation="strong">Metafields</TextStyle>
    </h3>
      {fieldsList}
    </div>
  )
}

const Index = () => {
  const { loading, error, data } = useQuery(GET_PRODUCTS_BY_ID);

  if(loading) return <div>Loading...</div>;
  if(error) return <div>Error {error.message}</div>;
  console.log(data);

  return (
    <Page>
      <TitleBar
        title="ReReviews"
        primaryAction={{
          content: 'Add Review...',
        }}
      />
      <Card>
        <ResourceList
          showHeader
          items={data['products']['edges']}
          renderItem={(item) => {
            const media = <Thumbnail alt="pic" source={item.node.featuredImage ? item.node.featuredImage.originalSrc : "https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg"} />;
            return (
              <ResourceList.Item id={item.node.id} url={item.node.id} media={media}>
                <h3>
                  <TextStyle variation="strong">{item.node.title}</TextStyle>
                </h3>
                <div>{item.node.description}</div>
                <Metafields metafields={item.node.metafields} />
              </ResourceList.Item>
            );
          }}
        />
      </Card>
    </Page>
  )
}

export default Index;
