import { Signal, computed, signal, untracked } from '@angular/core';
import {
  LEATHER,
  LaserEyesClient,
  LaserEyesStoreType,
  MAGIC_EDEN,
  NetworkType,
  OKX,
  OYL,
  PHANTOM,
  UNISAT,
  WIZZ,
  XVERSE,
  createStores,
} from 'lasereyes-core';

const client = new LaserEyesClient(createStores());

type SignalMap = {
  [k in keyof LaserEyesStoreType]: Signal<LaserEyesStoreType[k]>;
} & {
  network: Signal<NetworkType>;
};
export function useLaserEyes() {
  const mergedStore = computed;
  const initialState = {
    ...client.$store.get(),
    network: client.$network.get(),
  };
  // const signals = Object.fromEntries(Object.entries(client.$store.get()).map(([key, value]) => [key, signal(value)]));
  const state = signal(initialState);

  // TODO: Find how to add lifecycle hooks to remove these subscriptions
  const unsubscribeStore = client.$store.listen((store) => {
    // Object.entries(changed).forEach(([key, value]) => {
    //   signals[key].set(value);
    // });
    state.set({ ...store, network: untracked(state).network });
  });
  const unsubscribeNetwork = client.$network.listen((network) => {
    state.set({ ...untracked(state), network });
  });

  const {
    address,
    paymentAddress,
    publicKey,
    paymentPublicKey,
    accounts,
    balance,
    connected,
    hasProvider,
    isConnecting,
    isInitializing,
    provider,
    network,
  }: SignalMap = Object.fromEntries(
    Object.keys(initialState).map((key) => [
      key,
      computed(() => state()[key as keyof SignalMap]),
    ])
  ) as SignalMap;

  const laserEyes = {
    paymentAddress,
    address,
    publicKey,
    paymentPublicKey,
    network,
    accounts,
    balance: computed(() => Number(balance)),
    connected,
    isConnecting,
    isInitializing,
    provider,
    hasLeather: computed(() => hasProvider()[LEATHER] ?? false),
    hasMagicEden: computed(() => hasProvider()[MAGIC_EDEN] ?? false),
    hasOkx: computed(() => hasProvider()[OKX] ?? false),
    hasOyl: computed(() => hasProvider()[OYL] ?? false),
    hasPhantom: computed(() => hasProvider()[PHANTOM] ?? false),
    hasUnisat: computed(() => hasProvider()[UNISAT] ?? false),
    hasWizz: computed(() => hasProvider()[WIZZ] ?? false),
    hasXverse: computed(() => hasProvider()[XVERSE] ?? false),
    connect: client.connect.bind(client),
    disconnect: client.disconnect.bind(client),
    getBalance: async () =>
      ((await client.getBalance.call(client)) ?? '').toString(),
    getInscriptions: async () =>
      (await client.getInscriptions.call(client)) ?? [],
    getNetwork: client.getNetwork.bind(client),
    getPublicKey: async () => (await client.getPublicKey.call(client)) ?? '',
    pushPsbt: client.pushPsbt.bind(client),
    signMessage: async (message: string, toSignAddress?: string) =>
      (await client.signMessage.call(client, message, toSignAddress)) ?? '',
    requestAccounts: async () =>
      (await client.requestAccounts.call(client)) ?? [],
    sendBTC: async (to: string, amount: number) =>
      (await client.sendBTC.call(client, to, amount)) ?? '',
    signPsbt: async (psbt: string, finalize = false, broadcast = false) =>
      (await client.signPsbt.call(client, psbt, finalize, broadcast)) ?? {
        signedPsbtBase64: '',
        signedPsbtHex: '',
      },
    switchNetwork: async (network: NetworkType) => {
      await client.switchNetwork.call(client, network);
    },
  };

  return new Proxy(laserEyes, {
    get(target, prop: keyof typeof laserEyes) {
      // Check if prop is a signal
      if (prop in initialState) {
        return (target[prop] as Signal<any>)();
      }

      return target[prop];
    },
  });
}
