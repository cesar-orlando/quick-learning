import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import React, { useEffect, useState } from "react";
import { createStyles, Paper, Theme } from "@mui/material";

const useStyles = makeStyles(() =>
  createStyles({
    paper: {
      width: "80vw",
      height: "80vh",
      maxWidth: "500px",
      maxHeight: "700px",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      position: "relative",
    },
    paper2: {
      width: "80vw",
      maxWidth: "500px",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      position: "relative",
    },
    container: {
      width: "100vw",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    messagesBody: {
      width: "calc( 100% - 20px )",
      margin: 10,
      overflowY: "scroll",
      height: "calc( 100% - 80px )",
    },
  })
);

function CustomerChat() {
  const classes = useStyles();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <div className={classes.container}>
        <Paper className={classes.paper} zDepth={2}>
          <Paper id="style-1" className={classes.messagesBody}>
            <h1>Chat de clientes</h1>
          </Paper>
        </Paper>
      </div>
    </DashboardLayout>
  );
}

export default CustomerChat;
