import { Box, Modal, ModalContent, ModalOverlay } from "@chakra-ui/react";
import React from "react";
import { useFiles } from "../../../context/files";
import FileDetails from "./FileDetails";
import FilePreview from "./FilePreview";

const PreviewModal: React.FC = () => {
  const { previewFile, setPreviewFile } = useFiles();
  return (
    <Modal
      isOpen={previewFile !== null}
      onClose={() => setPreviewFile(null)}
      blockScrollOnMount={false}
      size="full"
    >
      <ModalOverlay />
      <ModalContent height="100%">
        {previewFile ? (
          <Box display={{ md: "block", lg: "flex" }} height="100%">
            <FileDetails file={previewFile} />
            <FilePreview file={previewFile} />
          </Box>
        ) : null}
      </ModalContent>
    </Modal>
  );
};

export default PreviewModal;
