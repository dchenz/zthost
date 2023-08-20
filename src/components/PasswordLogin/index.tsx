import { Spinner } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../context/user";
import { getAuthPropertiesById } from "../../database/auth";
import type { AuthProperties } from "../../database/model";
import CreatePassword from "./CreatePassword";
import LoginPassword from "./LoginPassword";

const PasswordLogin: React.FC = () => {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(true);
  const [authProperties, setAuthProperties] = useState<AuthProperties | null>(
    null
  );

  useEffect(() => {
    if (user) {
      getAuthPropertiesById(user.uid)
        .then(setAuthProperties)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return <Spinner />;
  }

  const onAuthComplete = () => {
    navigate("/");
  };

  if (!authProperties) {
    return <CreatePassword onAuthComplete={onAuthComplete} />;
  }

  return (
    <LoginPassword
      encryptedMainKey={authProperties.mainKey}
      onAuthComplete={onAuthComplete}
      salt={authProperties.salt}
    />
  );
};

export default PasswordLogin;
