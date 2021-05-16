import { TextField, Button, Stack, Modal, Select } from "@shopify/polaris";
import { ResourcePicker } from "@shopify/app-bridge-react";
import { useState } from "react";

const CreateReviewDialog = ({ open, onClose, onCancel }) => {
  const [active, setActive] = useState(open);
  const [productPicker, setProductPicker] = useState(false);
  const [productName, setProductName] = useState("");
  const [productId, setProductId] = useState("");
  const [published, setPublished] = useState("published");
  const [rating, setRating] = useState("5");
  const [name, setName] = useState("Alizé Martel");
  const [email, setEmail] = useState("test@shopify.io");
  const [review, setReview] = useState(
    "I don't know if it was the pressure of early adult life or the demands of college, but I began to experiment with huge ships in my late teens. I began by looking at huge ship magazines in the basement when my parents weren't around."
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
            onClose({
              rating: rating,
              name: name,
              email: email,
              review: review,
              productId: productId,
              visibility: published,
            });
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
                placeholder="Select a product..."
                value={productName}
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
                  const product = selectPayload.selection[0];
                  setProductId(product.id);
                  setProductName(product.title);
                  setProductPicker(false);
                }}
              />
            </Stack.Item>
            <Stack.Item fill>
              <Select
                label="Visibility"
                options={[
                  { label: "Published", value: "published" },
                  { label: "Hidden", value: "hidden" },
                ]}
                onChange={(newValue) => {
                  setPublished(newValue);
                }}
                value={published}
              />
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

export { CreateReviewDialog };
