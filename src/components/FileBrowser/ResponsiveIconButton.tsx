import { Button, IconButton } from "@chakra-ui/react";
import React from "react";
import { useMobileView } from "../../utils";

type ResponsiveIconButtonProps = {
  ariaLabel: string;
  icon: JSX.Element;
  onClick?: () => void;
  size?: string;
  text: string;
  title?: string;
};

const ResponsiveIconButton = React.forwardRef<
  HTMLButtonElement,
  ResponsiveIconButtonProps
>(({ ariaLabel, icon, text, onClick, size, title }, ref) => {
  const isMobileView = useMobileView();
  if (isMobileView) {
    return (
      <IconButton
        ref={ref}
        aria-label={ariaLabel}
        onClick={onClick}
        icon={icon}
        title={title}
        size={size}
      />
    );
  }
  return (
    <Button
      ref={ref}
      aria-label={ariaLabel}
      onClick={onClick}
      leftIcon={icon}
      title={title}
      size={size}
    >
      {text}
    </Button>
  );
});

ResponsiveIconButton.displayName = "ResponsiveIconButton";

export default ResponsiveIconButton;
