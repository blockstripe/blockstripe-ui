import 'regenerator-runtime/runtime';
import React, { useEffect, useState, useCallback } from 'react';
import { providers, utils } from 'near-api-js';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { Configurator, AddNewTenant, Wallet, WalletSelector, Logo } from './components';
import { methodNames, defaultNodeOptions } from './assets/types';
import './assets/index.css';

const createAccessKeyFor = process.env.CONTRACT_NAME;

export default function App() {
  const [accountData, setAccountData] = useState({
    accountHasTenant: false,
    accountId: null,
    tenantId: null,
  });
  const [myWallet, setMyWallet] = useState(null);

  const wallet = new Wallet({
    createAccessKeyFor,
  });

  const handleNEARLoginOnStartup = useCallback(async () => {
    const signedIn = await wallet.startUp();

    if (!signedIn) {
      wallet.signIn();
    } else {
      try {
        const tenantId = await wallet.viewMethod({
          contractId: createAccessKeyFor,
          contractMethod: methodNames.get_tenant_id_for_account,
          args: {
            tenant_account_id: wallet.accountId,
          },
        });

        setAccountData({
          accountHasTenant: !!tenantId,
          accountId: wallet.accountId,
          tenantId: tenantId,
        });
      } catch (err) {
        setAccountData({
          accountHasTenant: false,
          accountId: wallet.accountId,
        });
      }

      setMyWallet(wallet.wallet);
    }
  }, [setAccountData]);

  useEffect(() => {
    Logo('logo-container');
    handleNEARLoginOnStartup();
  }, []);

  const onTenantCreation = useCallback(async ({ email }) => {
    const outcome = await myWallet.signAndSendTransaction({
      signerId: accountData.accountId,
      receiverId: createAccessKeyFor,
      actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: methodNames.add_tenant,
              args: {
                email,
              },
              gas: defaultNodeOptions.tx_gas,
              deposit: defaultNodeOptions.tx_deposit,
            },
          },
      ],
    });
    
    setAccountData(prev => ({
      ...prev,
      accountHasTenant: true,
      tenantId: providers.getTransactionLastResult(outcome),
    }));
  }, [myWallet]);

  const onTenantExecutableAdd = useCallback(async ({ amount, receiverEmail, receiverAccountId, counts }) => {
    const args = {
      executable_counts: counts,
      executable_amount: amount,
      executable_recepient_account: receiverAccountId,
      executable_recepient_email: receiverEmail,
    };

    await myWallet.signAndSendTransaction({
      signerId: accountData.accountId,
      receiverId: createAccessKeyFor,
      actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: methodNames.add_tenant_executable,
              args: args,
              gas: defaultNodeOptions.tx_gas,
              deposit: utils.format.parseNearAmount((counts * amount).toString()),
            },
          },
      ],
    });
  }, [myWallet]);

  return (
    <main id="main">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <WalletSelector accountId={accountData.accountId} tenantId={accountData.tenantId} />
        {accountData.accountHasTenant ?
          <Configurator handleTenantExecutableCreation={onTenantExecutableAdd} accountId={accountData.accountId} /> :
          <AddNewTenant
            handleTenantCreation={onTenantCreation}
            handleConnectWallet={wallet.signIn.bind(wallet)}
            accountConnected={!!accountData.accountId}
          />
        }
      </LocalizationProvider>
    </main>
  );
};
