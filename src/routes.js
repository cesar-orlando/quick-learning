
// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import SignIn from "layouts/authentication/sign-in";

// @mui icons
import Icon from "@mui/material/Icon";
import Promoter from "layouts/promotor";
import PromoterDetails from "layouts/promotor/PromoterDetails";
import Customer from "layouts/customers";
import CustomerDetails from "layouts/customers/CustomerDetails";
import CustomerChat from "layouts/customers/customerChat";
import ChatApp from "layouts/chatApp/chatApp";
import AddCustomer from "layouts/customers/components/addCustomer";
import Advisor from "layouts/advisor";
import Sedes from "layouts/sedes";

const permissions = sessionStorage.getItem("permissions");

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
    route:"/add-customer",
    component: <AddCustomer />
  },
  {
    type: "collapse",
    name: "Asesores",
    key: "advisor",
    icon: <Icon fontSize="small">diversity_3</Icon>,
    route: "/advisor",
    component: <Advisor />,
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
    type: "collapse",
    name: "Sedes",
    key: "sede",
    icon: <Icon fontSize="small">chat</Icon>,
    route: "/sede",
    component: <Sedes />,
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

export default routes;
