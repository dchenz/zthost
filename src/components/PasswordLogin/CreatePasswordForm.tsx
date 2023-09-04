import { Button, FormControl, Input, Text, VStack } from "@chakra-ui/react";
import React, { useState } from "react";
import { MINIMUM_PASSWORD_LENGTH } from "../../config";

type CreatePasswordFormProps = {
  onSubmit: (password: string) => void;
};

const CreatePasswordForm: React.FC<CreatePasswordFormProps> = ({
  onSubmit,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const canSubmit =
    password.length > MINIMUM_PASSWORD_LENGTH && password === confirmPassword;

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
          <Input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <Text color="grey" fontSize="14px">
            Must be at least {MINIMUM_PASSWORD_LENGTH} characters.
          </Text>
        </FormControl>
        <FormControl>
          <Input
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
        </FormControl>
        <Button type="submit" isDisabled={!canSubmit} width="100%">
          Create
        </Button>
      </VStack>
    </form>
  );
};

export default CreatePasswordForm;
