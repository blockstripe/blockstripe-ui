import { useState, useCallback } from 'react';
import { Button, Container, TextField } from '@mui/material';

const AddNewTenant = ({ handleTenantCreation, handleConnectWallet, accountConnected }) => {
    const [newTenantEmail, setNewTenantEmail] = useState(null);

    const handleUpdateEmail = useCallback((e) => {
        setNewTenantEmail(e.target.value);
    });

    return accountConnected ? (
        <Container style={{ maxWidth: 400 }}>
            <h3>To configure your first reccurring payment add a new tenant for your account</h3>
            <TextField onChange={handleUpdateEmail} variant="standard" placeholder="Email" />
            <Button onClick={() => handleTenantCreation({ email: newTenantEmail })} variant="contained" style={{ left: 10 }}>Add tenant</Button>
        </Container>
    ) : (
        <Container style={{ maxWidth: 400 }}>
            <h3>First connect your wallet</h3>
            <Button onClick={handleConnectWallet} variant="contained">Connect wallet</Button>
        </Container>
    );
};

export default AddNewTenant;
