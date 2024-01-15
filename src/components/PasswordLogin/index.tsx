import { Spinner } from "@chakra-ui/react";
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config";
import { useGetUserAuthQuery } from "../../redux/databaseApi";
import { getCurrentUser } from "../../redux/userSlice";
import PasswordLoginForm from "./PasswordLoginForm";
import PasswordRegisterForm from "./PasswordRegisterForm";

const CheckUserAuth: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector(getCurrentUser);
  const { data: encryptedUserAuth, isLoading } = useGetUserAuthQuery({
    userId: user?.uid ?? "",
  });

  if (isLoading) {
    return <Spinner />;
  }

  const onAuthComplete = () => {
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
