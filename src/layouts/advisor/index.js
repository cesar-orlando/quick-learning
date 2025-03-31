import { Box, Button, Card, TextField, Typography, Menu, MenuItem, IconButton, Drawer, Select, InputLabel, FormControl } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DashboardLayout from "components/LayoutContainers/DashboardLayout";
import withAuth from "middleware/withJWT";
import { useEffect, useState } from "react";
import { advisorService } from "services/advisor";
import CloseIcon from "@mui/icons-material/Close";



function Advisor() {
    const [searchTerm, setSearchTerm] = useState("");
    const [advisor, setAdvisor] = useState([]);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedAdvisor, setSelectedAdvisor] = useState(null);
    const [openDrawer, setOpenDrawer] = useState(false);

    //crear un nuevo asesor
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [repassword, setRePassword] = useState("");
    const [permissions, setPermissions] = useState("");
    const [country, setCountry] = useState("");
    const [status, setStatus] = useState("");

    const getData = async () => {
        const response = await advisorService.getAdvisors();
        if (response.success) {
            setAdvisor(response.users);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        let id = selectedAdvisor.id;
        const response = await advisorService.deleteAdvisor(id);
        if (response.success) {
            setAdvisor(advisor.filter((item) => item.id !== id));
        }
        handleMenuClose();
    }

    const handleCreateAdvisor = async () => {
        let data = {
            "name": name,
            "email": email,
            "phone": phone,
            "password": password,
            "repassword": password,
            "permissions": permissions,
            "status": status,
            "country": country,
        }

        const response = await advisorService.createAdvisor(data);
        console.log("RESPONSE", response);
        if (response.success) {
            setAdvisor(advisor.filter((item) => item.phone !== phone));
        }
        handleMenuClose();
    }

    const handleCreate = async () => {
        setOpenDrawer(true);
    }

    useEffect(() => {
        getData();
    }, []);

    const handleMenuOpen = (event, advisor) => {
        setAnchorEl(event.currentTarget); // Establece el elemento anclado para el menú
        setSelectedAdvisor(advisor); // Guarda el asesor seleccionado
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedAdvisor(null);
    };

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
    };

    const columns = [
        { field: "name", headerName: "Nombre", flexDirection: 1, minWidth: 300 },
        { field: "permissions", headerName: "Permisos", flexDirection: 1, minWidth: 100 },
        { field: "email", headerName: "Email", flexDirection: 1, minWidth: 250 },
        { field: "phone", headerName: "Teléfono", flexDirection: 1, minWidth: 100 },
        { field: "status", headerName: "Estado", flexDirection: 1, minWidth: 100 },
        {
            field: "actions",
            headerName: "Acciones",
            flexDirection: 1,
            minWidth: 150,
            sortable: false,
            renderCell: (params) => (
                <>
                    <IconButton
                        onClick={(event) => handleMenuOpen(event, params.row)}
                    >
                        <MoreVertIcon />
                    </IconButton>
                </>
            ),
        },
    ];




    return (
        <DashboardLayout>
            <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
                <Card sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Asesores
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
                        <TextField
                            label="Buscar"
                            variant="outlined"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ maxWidth: 300 }}
                        />

                        <Button variant="contained" color="primary" onClick={() => { handleCreate() }} >
                            <Typography variant="button" sx={{ fontSize: "0.8rem", color: "#fff", fontWeight: "bold" }}>
                                Crear
                            </Typography>
                        </Button>
                    </Box>
                    <Box sx={{ height: "88vh", width: "100%" }}>
                        <DataGrid
                            rows={advisor}
                            columns={columns}
                            pageSize={50} // Aumentar el número de filas por página
                            autoPageSize
                            disableColumnMenu
                            disableSelectionOnClick
                            loading={loading}
                            // onRowClick={handleRowClick}
                            rowHeight={38} // Reducir la altura de las filas
                            sx={{
                                width: "100%",
                                "& .MuiDataGrid-root": { borderRadius: "10px" },
                                "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5", fontWeight: "bold" },
                                fontSize: "0.8rem", // Reducir el tamaño de la fuente
                                fontWeight: "bold",
                            }}
                        />
                    </Box>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        {/* <MenuItem onClick={handleEdit}>Editar</MenuItem> */}
                        <MenuItem onClick={handleDelete}>Eliminar</MenuItem>
                    </Menu>
                </Card>
            </Box>

            {/* Panel de crear asesor */}
            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={handleCloseDrawer}
                sx={{
                    width: "100vw",
                    "& .MuiDrawer-paper": {
                        width: "70vw",
                        display: "flex",
                        flexDirection: "column",
                    },
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", padding: 2, width: "100%" }}>
                    <IconButton onClick={handleCloseDrawer} sx={{ float: "right", position: "absolute", right: 0, top: 0 }}>
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h5" gutterBottom>
                        Crear Asesor
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, padding: 2 }}>
                        <TextField
                            label="Nombre"
                            variant="outlined"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <TextField
                            label="Email"
                            variant="outlined"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            label="Teléfono"
                            variant="outlined"
                            fullWidth
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <TextField
                            label="Contraseña"
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <FormControl fullWidth>
                            <InputLabel
                                id="permissions-label"
                            >
                                Permisos
                            </InputLabel>
                            <Select
                                sx={{ fontSize: "0.9rem", padding: "0.5rem" }}
                                labelId="permissions-label"
                                value={permissions ? permissions : 0}
                                onChange={(e) => setPermissions(e.target.value)}
                                label="Permisos"
                            >
                                <MenuItem value={0}></MenuItem>
                                <MenuItem value={1}>Administrador</MenuItem>
                                <MenuItem value={2}>Asistente</MenuItem>
                                <MenuItem value={3}>Asesor</MenuItem>
                                <MenuItem value={4}>Cliente</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel
                                id="permissions-label"
                            >
                                Status
                            </InputLabel>
                            <Select
                                sx={{ fontSize: "0.9rem", padding: "0.5rem" }}
                                labelId="status-label"
                                value={status ? status : 0}
                                onChange={(e) => setStatus(e.target.value)}
                                label="Status"

                            >
                                <MenuItem value={"0"}></MenuItem>
                                <MenuItem value={"1"}>Activo</MenuItem>
                                <MenuItem value={"2"}>Inactivo</MenuItem>
                                <MenuItem value={"3"}>Eliminado</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Ciudad"
                            variant="outlined"
                            fullWidth
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                        />
                        <Button variant="contained" color="primary" onClick={handleCreateAdvisor}>
                            <Typography variant="button" sx={{ fontSize: "0.8rem", color: "#fff", fontWeight: "bold" }}>
                                Crear
                            </Typography>
                        </Button>
                    </Box>
                </Box>

            </Drawer>

        </DashboardLayout>

    );
}

export default withAuth(Advisor);