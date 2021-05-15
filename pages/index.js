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
  Loading,
  Avatar,
  TextStyle,
  Thumbnail,
  Frame,
  IndexTable,
  EmptyState,
  Badge,
} from "@shopify/polaris";
import {
  TitleBar,
  useAppBridge,
  ResourcePicker,
} from "@shopify/app-bridge-react";
import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "react-apollo";
import gql from "graphql-tag";
import Rating from "react-simple-star-rating";

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

const ModalWithPrimaryActionExample = ({ open, onClose, onCancel }) => {
  const [active, setActive] = useState(open);
  const [productPicker, setProductPicker] = useState(false);
  const [productId, setProductId] = useState("");
  const [rating, setRating] = useState("5");
  const [name, setName] = useState("Alizé Martel");
  const [email, setEmail] = useState("test@shopify.io");
  const [review, setReview] = useState(
    "I don't know if it was the pressure of early adult life or the demands of college, but I began to experiment with huge ships in my late teens. I began by looking at huge ship magazines in the basement when my parents weren't around. Then one day, my mom came home early and unexpectedly caught me in the act. Both of my parents were furious. They asked me where I go the magazine from and I said I found it and that I thought it only contained articles on small watercraft."
  );

  const closeModal = () => {
    setActive(false);
    onCancel();
  };

  return (
    <div style={{ height: "500px" }}>
      <Modal
        open={active}
        onClose={() => closeModal()}
        title="New review"
        primaryAction={{
          content: "Create",
          onAction: () => {
            onClose(rating, name, email, review, productId);
          },
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => closeModal(),
          },
        ]}
      >
        <Modal.Section>
          <Stack vertical>
            <Stack.Item fill>
              <TextField
                label="Product"
                type="string"
                value={productId}
                disabled={true}
                connectedRight={
                  <Button onClick={() => setProductPicker(true)}>Browse</Button>
                }
              />
              <ResourcePicker
                resourceType="Product"
                open={productPicker}
                selectMultiple={false}
                onSelection={(selectPayload) => {
                  setProductId(selectPayload.selection[0].id);
                  setProductPicker(false);
                }}
              />
            </Stack.Item>
            <Stack.Item fill>
              <TextField
                label="Rating"
                type="number"
                max={5}
                min={0}
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

  const closeModel = useCallback((rating, name, email, review, productId) => {
    setAddMetafieldDialogOpen(false);
    setOperationRunning(true);
    addPublicMetafield(
      createMetafieldInput(
        productId,
        JSON.stringify({
          rating: rating,
          name: name,
          email: email,
          review: review,
        })
      )
    );
  }, []);

  const resourceName = {
    singular: "review",
    plural: "reviews",
  };

  if (loading)
    return (
      <div>
        <Frame>
          <Loading />
        </Frame>
      </div>
    );
  if (error) return <div>Error {error.message}</div>;

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

      const review = JSON.parse(edge.node.value);

      return (
        <ResourceItem
          id={edge.node.id}
          media={media}
          shortcutActions={shortcutActions}
          accessibilityLabel={`View details for ${edge.node.id}`}
        >
          <Stack wrap={false}>
            <Stack.Item fill>
              <h3>
                <Rating
                  ratingValue={review.rating}
                  size={15}
                  fillColor="orange"
                  emptyColor="gray"
                />
              </h3>
              <div>
                <TextStyle variation="strong">{review.review}</TextStyle>
              </div>
              <TextStyle variation="subdued">
                {review.name} ({review.email})
              </TextStyle>
            </Stack.Item>
            <Stack.Item>
              <Badge status="success">Published</Badge>
            </Stack.Item>
          </Stack>
        </ResourceItem>
      );
    });
  };

  console.log(data);

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
        onCancel={() => setAddMetafieldDialogOpen(false)}
        onClose={(rating, name, email, review, productId) =>
          closeModel(rating, name, email, review, productId)
        }
      />
    </Page>
  );
};

export default Index;
