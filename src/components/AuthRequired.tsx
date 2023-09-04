import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../config";
import { useCurrentUser } from "../context/user";

type AuthRequiredProps = {
  children: React.ReactNode;
};

const AuthRequired: React.FC<AuthRequiredProps> = ({ children }) => {
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.loginWithProvider);
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default AuthRequired;
