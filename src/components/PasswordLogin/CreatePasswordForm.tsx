import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";

type CreatePasswordFormProps = {
  onSubmit: (password: string) => void;
};

const CreatePasswordForm: React.FC<CreatePasswordFormProps> = ({
  onSubmit,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const canSubmit = password.length > 8 && password === confirmPassword;

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }
    onSubmit(password);
  };

  return (
    <form onSubmit={onFormSubmit} style={{ width: "400px" }}>
      <VStack gap={5}>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Confirm password</FormLabel>
          <Input
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FormControl>
        <Button
          colorScheme="teal"
          type="submit"
          variant="solid"
          isDisabled={!canSubmit}
          width="100%"
        >
          Create
        </Button>
      </VStack>
    </form>
  );
};

export default CreatePasswordForm;
