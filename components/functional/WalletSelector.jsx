import { Card, CardContent } from '@mui/material';

const WalletViewer = ({ accountId, tenantId }) => {
    return accountId ? (
        <Card variant="outlined" style={{ position: 'absolute', top: 0, right: 20 }}>
            <CardContent style={{ paddingBottom: 0, paddingTop: 0 }}>
                <p><b>Connected NEAR wallet</b> {accountId}</p>
                {tenantId && <p><b>Tenant ID</b> {tenantId}</p>}
            </CardContent>
        </Card>
    ) : <></>;
};

export default WalletViewer;
