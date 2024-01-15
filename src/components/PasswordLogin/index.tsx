import { Spinner } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config";
import { useDatabase } from "../../context/database";
import { getCurrentUser } from "../../redux/userSlice";
import PasswordLoginForm from "./PasswordLoginForm";
import PasswordRegisterForm from "./PasswordRegisterForm";
import type { UserAuthDocument } from "../../database/model";

const CheckUserAuth: React.FC = () => {
  const { user } = useSelector(getCurrentUser);
  const { getUserAuth } = useDatabase();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(true);
  const [encryptedUserAuth, setEncryptedUserAuth] =
    useState<UserAuthDocument | null>(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getUserAuth(user.uid)
        .then(setEncryptedUserAuth)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (isLoading) {
    return <Spinner />;
  }

  const onAuthComplete = () => {
    setEncryptedUserAuth(null);
    navigate(ROUTES.index);
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

const PasswordLogin: React.FC = () => {
  return <CheckUserAuth />;
};

export default PasswordLogin;
