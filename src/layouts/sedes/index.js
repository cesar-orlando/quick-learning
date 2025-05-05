import { Box, Card, Typography } from "@mui/material";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { sedesService } from "services/sedes";

function Sedes() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    const getSedes = async () => {
        const {data, sucess, loading} = await sedesService.getSedes();
        if(sucess){
            setData(data);
        } else {
            setError("Error fetching sedes");
        }
        setLoading(loading);
    }

    useEffect(() => {
        getSedes();
    }, []);

    return (
        <DashboardLayout>
            <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
                <Card sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Clientes
                    </Typography>
                </Card>
            </Box>

        </DashboardLayout>
    );
}
export default Sedes;