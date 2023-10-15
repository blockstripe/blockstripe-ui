import { providers, Contract } from 'near-api-js';
import '@near-wallet-selector/modal-ui/styles.css';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';

class Wallet {
  walletSelector;
  wallet;
  network = 'testnet';
  createAccessKeyFor;

  constructor({ createAccessKeyFor, network }) {
    this.createAccessKeyFor = createAccessKeyFor;

    if (network) {
      this.network = network;
    }
  }

  async startUp() {
    this.walletSelector = await setupWalletSelector({
      network: this.network,
      modules: [setupMyNearWallet()],
    });

    const isSignedIn = this.walletSelector.isSignedIn();

    if (isSignedIn) {
      this.wallet = await this.walletSelector.wallet();
      this.accountId = this.walletSelector.store.getState().accounts[0].accountId;
    }

    return isSignedIn;
  }

  signIn() {
    const description = 'Please select a wallet to sign in.';
    const modal = setupModal(this.walletSelector, { contractId: this.createAccessKeyFor, description });

    modal.show();
  }

  signOut() {
    this.wallet.signOut();
    this.wallet = this.accountId = this.createAccessKeyFor = null;

    window.location.replace(window.location.origin + window.location.pathname);
  }

  getProvider() {
    const { network } = this.walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
  
    return provider;
  }

  async viewMethod({ contractId, contractMethod, args = {} }) {
    const { network } = this.walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
  
    const response = await provider.query({
      request_type: 'call_function',
      account_id: contractId,
      method_name: contractMethod,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
      finality: 'optimistic',
    });

    return JSON.parse(Buffer.from(response.result).toString());
  }
}

export default Wallet;
