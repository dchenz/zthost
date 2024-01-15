import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { useDispatch } from "react-redux";
import { completePasswordRegistration } from "../../redux/userSlice";
import CreatePasswordForm from "./CreatePasswordForm";
import type { AppDispatch } from "../../store";

type PasswordRegisterFormProps = {
  onAuthComplete: () => void;
};

const PasswordRegisterForm: React.FC<PasswordRegisterFormProps> = ({
  onAuthComplete,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const onSubmit = async (password: string) => {
    dispatch(completePasswordRegistration(password));
    onAuthComplete();
  };

  return (
    <Box p={5}>
      <VStack gap={5}>
        <Heading size="md">Create a password</Heading>
        <Text>
          This will be used to encrypt/decrypt all your data. Don&apos;t forget
          it!
        </Text>
        <CreatePasswordForm onSubmit={onSubmit} />
      </VStack>
    </Box>
  );
};

export default PasswordRegisterForm;
