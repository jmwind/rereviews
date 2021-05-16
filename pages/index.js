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
import { DeleteMajor, RefreshMajor } from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";
import { useQuery, useMutation } from "react-apollo";
import Rating from "react-simple-star-rating";
import {
  GET_PRODUCTS,
  ADD_METAFIELDS_BY_ID,
  DELETE_METAFIELD_BY_ID,
  ADD_PRIVATE_METAFIELDS_BY_ID,
  DELETE_PRIVATE_METAFIELD_BY_ID,
  createMetafieldInput,
  createDeleteMetafieldInput,
  createPrivateMetafieldInput,
  createDeletePrivateMetafieldInput,
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
  const [addPrivatePublicMetafield] = useMutation(
    ADD_PRIVATE_METAFIELDS_BY_ID,
    {
      onCompleted: () => {
        refetch();
        setOperationRunning(false);
      },
    }
  );
  const [removePublicMetafield] = useMutation(DELETE_METAFIELD_BY_ID, {
    onCompleted: () => {
      refetch();
      setOperationRunning(false);
    },
  });
  const [removePrivateMetafield] = useMutation(DELETE_PRIVATE_METAFIELD_BY_ID, {
    onCompleted: () => {
      refetch();
      setOperationRunning(false);
    },
  });

  const closeModel = useCallback((data) => {
    setAddMetafieldDialogOpen(false);
    setOperationRunning(true);
    const value = JSON.stringify({
      rating: data.rating,
      name: data.name,
      email: data.email,
      review: data.review,
      visibility: data.visibility,
    });
    if (data.visibility === "published") {
      addPublicMetafield(createMetafieldInput(data.productId, value));
    } else {
      addPrivatePublicMetafield(
        createPrivateMetafieldInput(data.productId, value)
      );
    }
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

  console.log(data);

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

    const reviews = [
      ...item.node.metafields.edges,
      ...item.node.privateMetafields.edges,
    ];

    return reviews.map((edge) => {
      const review = JSON.parse(edge.node.value);
      const publishedStatus =
        review.visibility === "published" ? "success" : "warning";

      const shortcutActions = [
        {
          icon: DeleteMajor,
          accessibilityLabel: `Delete review`,
          onAction: () => {
            setOperationRunning(true);
            if (edge.node.__typename == "PrivateMetafield") {
              removePrivateMetafield(
                // TODO: the difference in APIs between private and public metafields
                // is gross! We should pass in the id of the metafield. Docs are wrong
                // you can't delete without the owning product id in the mutation.
                createDeletePrivateMetafieldInput(
                  item.node.id,
                  edge.node.namespace,
                  edge.node.key
                )
              );
            } else {
              removePublicMetafield(createDeleteMetafieldInput(edge.node.id));
            }
          },
        },
        {
          icon: RefreshMajor,
          accessibilityLabel: "Toggle visibility",
          onAction: () => {
            if (edge.node.__typename == "PrivateMetafield") {
              review.visibility = "published";
              addPublicMetafield(
                createMetafieldInput(item.node.id, JSON.stringify(review))
              );
              removePrivateMetafield(
                createDeletePrivateMetafieldInput(
                  item.node.id,
                  edge.node.namespace,
                  edge.node.key
                )
              );
            } else {
              review.visibility = "hidden";
              addPrivatePublicMetafield(
                createPrivateMetafieldInput(
                  item.node.id,
                  JSON.stringify(review)
                )
              );
              removePublicMetafield(createDeleteMetafieldInput(edge.node.id));
            }
          },
        },
      ];

      return (
        <ResourceItem
          id={edge.node.id}
          media={media}
          shortcutActions={shortcutActions}
          accessibilityLabel={`View details for ${edge.node.id}`}
          persistActions
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
              <Badge status={publishedStatus}>{review.visibility}</Badge>
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
        onClose={(data) => closeModel(data)}
      />
    </Page>
  );
};

export default Index;
