
// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";

// @mui icons
import Icon from "@mui/material/Icon";
import Companies from "layouts/companies";
import Promoter from "layouts/promotor";
import PromoterDetails from "layouts/promotor/PromoterDetails";
import CompanyDetails from "layouts/companies/companyDetails";
import Customer from "layouts/customers";
import CustomerDetails from "layouts/customers/CustomerDetails";
import CustomerChat from "layouts/customers/customerChat";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
/*   {
    type: "collapse",
    name: "Tables",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: <Tables />,
  }, */
  {
    type: "collapse",
    name: "Clientes",
    key: "customer",
    icon: <Icon fontSize="small">support_agent</Icon>,
    route: "/customer",
    component: <Customer />,
  },
  {
    type: "collapse",
    name: "Promotores",
    key: "promoter",
    icon: <Icon fontSize="small">diversity_3</Icon>,
    route: "/promoter",
    component: <Promoter />,
  },
  {
    route: "/promoter/:id",
    component: <PromoterDetails />,

  },
  {
    route: "/company/:id",
    component: <CompanyDetails />,

  },
  {
    route: "/customer/:id",
    component: <CustomerDetails />,

  },
  {
    route: "/customer/chat/:id",
    component: <CustomerChat />,

  },
/*   {
    type: "collapse",
    name: "Billing",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: <Billing />,
  },
  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />, 
  },  */

];

export default routes;
