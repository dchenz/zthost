import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../context/user";

type AuthRequiredProps = {
  children: React.ReactNode;
};

const AuthRequired: React.FC<AuthRequiredProps> = ({ children }) => {
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);

  return <>{children}</>;
};

export default AuthRequired;
