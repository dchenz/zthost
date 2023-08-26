import { Spinner } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../context/user";
import { getUserAuth } from "../../database/auth";
import PasswordLoginForm from "./PasswordLoginForm";
import PasswordRegisterForm from "./PasswordRegisterForm";
import type { AuthProperties } from "../../database/model";

const PasswordLogin: React.FC = () => {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [encryptedUserAuth, setEncryptedUserAuth] =
    useState<AuthProperties | null>(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getUserAuth(user.uid)
        .then(setEncryptedUserAuth)
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
    setEncryptedUserAuth(null);
    navigate("/");
  };

  if (!encryptedUserAuth) {
    return <PasswordRegisterForm onAuthComplete={onAuthComplete} />;
  }

  return (
    <PasswordLoginForm
      encryptedUserAuth={encryptedUserAuth}
      onAuthComplete={onAuthComplete}
    />
  );
};

export default PasswordLogin;
