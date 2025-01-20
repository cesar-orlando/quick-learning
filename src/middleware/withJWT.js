import { useNavigate } from "react-router-dom";

const withAuth = WrappedComponent => {
  return props => {
    // checks whether we are on client / browser or server.
    if (typeof window !== 'undefined') {
        const navigate = useNavigate();
      

      const accessToken = sessionStorage.getItem('token')
      const user = sessionStorage.getItem('user')

      // If there is no access token we redirect to "/" page.
      if (!accessToken ) {
        navigate("/authentication/sign-in");

        return null
      }

      // If this is an accessToken we just render the component that was passed with all its props

      return <WrappedComponent {...props} />
    }

    // If we are on server, return null
    return null
  }
}

export default withAuth

