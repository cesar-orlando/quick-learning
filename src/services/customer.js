import axios from "axios";
import DropdownChat from "components/DropdownChat/DropDownChat";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Fragment } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Menu, MenuItem } from "@mui/material";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";


export const customerService = {
  getCustomers,
};

async function getCustomers( editCustomer, viewChat, handleToggleIA ) {
  try {
    const getPermissions = sessionStorage.getItem("permissions");
    const getUser = sessionStorage.getItem("user");
    let response;
    if (getPermissions === "1") {
      response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/quicklearning/list`);
    } else {
      response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/quicklearning/customers/conversations/${getUser}`);
    }

    const getFlagEmoji = (classification, status) => {
      if (classification === "Prospecto" && status === "Interesado") return "🟢";
      if (classification === "Prospecto") return "🟡";
      if (classification === "Alumno") return "🔵";
      if (classification === "Urgente") return "🔴";
      if (["No interesado por precio", "Número equivocado", "Ofrece servicios", "No contesta"].includes(classification)) return "⚪";
      return "";
    };


    const filterData = response.data.customers.map((item) => {
      const flagEmoji = getFlagEmoji(item.classification, item.status);
      return {
      nameText: item.name.toLowerCase(),
      phoneText: item.phone.toLowerCase(),
      statusText: item.status || "Desconocido",
      ia: item.ia,
      name: (
        <MDBox display="flex" alignItems="left">
           <MDTypography variant="button" fontWeight="medium" sx={{ mr: 1 }}>
              {flagEmoji}
            </MDTypography>
          <MDBox
            lineHeight={1}
            sx={{
              maxWidth: "200px", // Fija el ancho máximo del contenedor
              whiteSpace: "normal", // Permite saltos de línea
              wordWrap: "break-word", // Ajusta palabras largas
              overflowWrap: "break-word", // Compatibilidad adicional
            }}
          >
            <MDTypography
              display="block"
              variant="button"
              fontWeight="medium"
              sx={{
                whiteSpace: "normal", // Forza saltos de línea
                wordWrap: "break-word", // Ajusta palabras largas
                overflowWrap: "break-word", // Compatibilidad adicional
              }}
            >
              {item.name}
            </MDTypography>
            <MDTypography
              variant="caption"
              sx={{
                whiteSpace: "normal", // Forza saltos de línea
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {item.phone}
            </MDTypography>
          </MDBox>
        </MDBox>
      ),
      lastmessage: (
        <MDBox display="flex" alignItems="left">
          <DropdownChat
            id={item._id}
            messages={item.messages}
            customer={item}
            getCustomers={getCustomers}
          />
        </MDBox>
      ),
      status: (
        <MDBox display="flex" alignItems="left">
          <MDBox
            lineHeight={1}
            sx={{
              maxWidth: "200px", // Fija el ancho máximo del contenedor
              whiteSpace: "normal", // Permite saltos de línea
              wordWrap: "break-word", // Ajusta palabras largas
              overflowWrap: "break-word", // Compatibilidad adicional
            }}
          >
            <MDTypography
              display="block"
              variant="button"
              fontWeight="medium"
              sx={{
                whiteSpace: "normal", // Forza saltos de línea
                wordWrap: "break-word", // Ajusta palabras largas
                overflowWrap: "break-word", // Compatibilidad adicional
              }}
            >
              {item.status}
            </MDTypography>
            <MDTypography
              variant="caption"
              sx={{
                whiteSpace: "normal", // Forza saltos de línea
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {item.classification}
            </MDTypography>
          </MDBox>
        </MDBox>
      ),
      action: (
        <PopupState variant="popover" popupId="menu-popup">
          {(popupState) => (
            <Fragment>
              <MoreVertIcon {...bindTrigger(popupState)} />
              <Menu {...bindMenu(popupState)}>
                <MenuItem onClick={() => editCustomer(item, popupState)}>Editar</MenuItem>
                <MenuItem onClick={() => viewChat(item, popupState)}>Ver Chat</MenuItem>
                <MenuItem onClick={() => handleToggleIA(item, popupState)}>{item.ia ? "Desactivar IA" : "Activar IA"}</MenuItem>
              </Menu>
            </Fragment>
          )}
        </PopupState>
      ),
    }});

    return { data: filterData, loading: false, success: true };
  } catch (error) {
    console.error(error);
    return { data: [], loading: false, success: false };
  }
}