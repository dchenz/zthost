import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../config";
import { getCurrentUser } from "../redux/userSlice";

type AuthRequiredProps = {
  children: React.ReactNode;
};

const AuthRequired: React.FC<AuthRequiredProps> = ({ children }) => {
  const { user } = useSelector(getCurrentUser);
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
