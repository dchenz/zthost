import { Box, Modal, ModalContent, ModalOverlay } from "@chakra-ui/react";
import React from "react";
import { useFiles } from "../../../context/files";
import FileDetails from "./FileDetails";
import FilePreview from "./FilePreview";

const PreviewModal: React.FC = () => {
  const { previewFile, setPreviewFile } = useFiles();
  return (
    <Modal isOpen={previewFile !== null} onClose={() => setPreviewFile(null)}>
      <ModalOverlay />
      <ModalContent maxW="80vw">
        {previewFile ? (
          <Box display={{ md: "block", lg: "flex" }}>
            <FilePreview file={previewFile} />
            <FileDetails file={previewFile} />
          </Box>
        ) : null}
      </ModalContent>
    </Modal>
  );
};

export default PreviewModal;
