import {
  TextContainer,
  TextField,
  Button,
  Stack,
  Modal,
  ResourceItem,
  Page,
  Card,
  ResourceList,
  Avatar,
  TextStyle,
  Thumbnail,
  IndexTable,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "react-apollo";
import gql from "graphql-tag";

const GET_PRODUCTS_BY_ID = gql`
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

const ModalWithPrimaryActionExample = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(open);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("Alizé Martel");
  const [email, setEmail] = useState("test@shopify.io");
  const [review, setReview] = useState("Write something nice");

  const toggleModal = useCallback(() => {
    setLoading(true);
    onClose(rating, name, email, review);
    setActive((active) => !active);
  }, []);

  return (
    <div style={{ height: "500px" }}>
      <Modal
        open={active}
        loading={loading}
        onClose={toggleModal}
        title="Create new review"
        primaryAction={{
          content: "Save",
          onAction: toggleModal,
        }}
      >
        <Modal.Section>
          <Stack vertical>
            <Stack.Item fill>
              <TextField
                label="Rating"
                value={rating}
                onChange={(newValue) => {
                  setRating(newValue);
                }}
              />
              <TextField
                label="Username"
                value={name}
                onChange={(newValue) => {
                  setName(newValue);
                }}
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(newValue) => {
                  setEmail(newValue);
                }}
              />
              <TextField
                label="Review"
                value={review}
                multiline={3}
                onChange={(newValue) => {
                  setReview(newValue);
                }}
              />
            </Stack.Item>
          </Stack>
        </Modal.Section>
      </Modal>
    </div>
  );
};

const Index = () => {
  const { loading, error, data, refetch } = useQuery(GET_PRODUCTS_BY_ID);
  const [operationRunning, setOperationRunning] = useState(false);
  const [addMetafieldDialogOpen, setAddMetafieldDialogOpen] = useState(false);
  const [addPublicMetafield, { mutationData }] = useMutation(
    ADD_METAFIELDS_BY_ID,
    {
      onCompleted: () => {
        refetch();
        setOperationRunning(false);
      },
    }
  );
  const [removePublicMetafield, { deleteMutationData }] = useMutation(
    DELETE_METAFIELD_BY_ID,
    {
      onCompleted: () => {
        refetch();
        setOperationRunning(false);
      },
    }
  );

  const closeModel = useCallback((rating, name, email, review) => {
    setAddMetafieldDialogOpen(false);
    setOperationRunning(true);
    addPublicMetafield(
      createMetafieldInput("gid://shopify/Product/6586388578386",
      JSON.stringify({
        rating: rating,
        name: name,
        email: email,
        review: review,
      })
    ));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error {error.message}</div>;

  const resourceName = {
    singular: "review",
    plural: "reviews",
  };

  const promotedBulkActions = [
    {
      content: "Approve",
      onAction: () => console.log("Todo: implement bulk edit"),
    },
    {
      content: "Demote",
      onAction: () => console.log("Todo: implement bulk edit"),
    },
    {
      content: "Delete",
      onAction: () => console.log("Todo: implement bulk edit"),
    },
  ];

  const renderItem = (item) => {
    const media = (
      <Thumbnail
        alt="pic"
        source={
          item.node.featuredImage
            ? item.node.featuredImage.originalSrc
            : "https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg"
        }
      />
    );
    return item.node.metafields.edges.map((edge) => {
      const shortcutActions = [
        {
          content: "Clone review",
          accessibilityLabel: `Clone review`,
          onAction: () => {
            setOperationRunning(true);
            addPublicMetafield(
              createMetafieldInput(
                item.node.id,
                JSON.stringify({
                  rating: 5,
                  name: "nadine",
                  email: "email",
                  review: "this was a great product",
                })
              )
            );
          },
        },
        {
          content: "Delete review",
          accessibilityLabel: `Delete review`,
          onAction: () => {
            setOperationRunning(true);
            removePublicMetafield(createDeleteMetafieldInput(edge.node.id));
          },
        },
      ];
      return (
        <ResourceItem
          id={edge.node.id}
          media={media}
          shortcutActions={shortcutActions}
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
          </Stack>
        </ResourceItem>
      );
    });
  };

  return (
    <Page>
      <TitleBar
        title="ReReviews"
        primaryAction={{
          content: "Add review",
          onAction: () => {
            setAddMetafieldDialogOpen(true);
          },
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
      <ModalWithPrimaryActionExample
        key={addMetafieldDialogOpen}
        open={addMetafieldDialogOpen}
        onClose={(rating, name, email, review) => closeModel(rating, name, email, review)}
      />
    </Page>
  );
};

export default Index;
