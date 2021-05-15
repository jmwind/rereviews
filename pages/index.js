import {
  Stack,
  ResourceItem,
  Page,
  Card,
  ResourceList,
  Loading,
  TextStyle,
  Thumbnail,
  Frame,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";
import { useQuery, useMutation } from "react-apollo";
import Rating from "react-simple-star-rating";
import {
  GET_PRODUCTS,
  ADD_METAFIELDS_BY_ID,
  DELETE_METAFIELD_BY_ID,
  createMetafieldInput,
  createDeleteMetafieldInput,
} from "./graphql";
import { CreateReviewDialog } from "./newreview";

const Index = () => {
  const { loading, error, data, refetch } = useQuery(GET_PRODUCTS);
  const [operationRunning, setOperationRunning] = useState(false);
  const [addMetafieldDialogOpen, setAddMetafieldDialogOpen] = useState(false);
  const [addPublicMetafield] = useMutation(ADD_METAFIELDS_BY_ID, {
    onCompleted: () => {
      refetch();
      setOperationRunning(false);
    },
  });
  const [removePublicMetafield] = useMutation(DELETE_METAFIELD_BY_ID, {
    onCompleted: () => {
      refetch();
      setOperationRunning(false);
    },
  });

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
                  transtition={false}
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
      <CreateReviewDialog
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
