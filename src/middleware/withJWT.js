import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const withAuth = WrappedComponent => {
  return props => {
    const navigate = useNavigate();

    useEffect(() => {
      const accessToken = sessionStorage.getItem('token');
      const user = sessionStorage.getItem('user');

      // If there is no access token we redirect to "/authentication/sign-in" page.
      if (!accessToken) {
        console.log("entra aqui");
        navigate("/authentication/sign-in");
      }
    }, [navigate]);

    const accessToken = sessionStorage.getItem('token');

    // If there is no access token, do not render the component
    if (!accessToken) {
      return null;
    }

    // If there is an access token, render the component that was passed with all its props
    return <WrappedComponent {...props} />;
  };
};

export default withAuth;

