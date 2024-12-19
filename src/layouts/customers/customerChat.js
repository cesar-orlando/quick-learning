import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import React, { useEffect, useState } from "react";
import { createStyles, makeStyles, Paper, Theme } from "@mui/material";


function CustomerChat() {

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <div >
            <h1>Chat de clientes</h1>
      </div>
    </DashboardLayout>
  );
}

export default CustomerChat;
