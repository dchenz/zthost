import { useMediaQuery } from "@chakra-ui/react";

export const useMobileView = () => {
  const [isMobileView] = useMediaQuery("(max-width: 600px)");

  return isMobileView;
};
