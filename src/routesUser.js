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
import PromoterDetails from "layouts/promotor/PromoterDetails";
import Customer from "layouts/customers";
import CustomerDetails from "layouts/customers/CustomerDetails";
import CustomerChat from "layouts/customers/customerChat";
import ChatApp from "layouts/chatApp/chatApp";
import AddCustomer from "layouts/customers/components/addCustomer";

const routesUser = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Clientes",
    key: "customer",
    icon: <Icon fontSize="small">support_agent</Icon>,
    route: "/customer",
    component: <Customer />,
  },
  {
    route: "/add-customer",
    component: <AddCustomer />,
  },
  {
    type: "collapse",
    name: "Quick Chat",
    key: "chat",
    icon: <Icon fontSize="small">chat</Icon>,
    route: "/chat",
    component: <ChatApp />,
  },
  {
    route: "/promoter/:id",
    component: <PromoterDetails />,
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
  */
  {
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
];

export default routesUser;
