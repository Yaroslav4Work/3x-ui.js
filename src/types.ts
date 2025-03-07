import * as enums from './enums';

export type ApiResponse<T> = {
  success: boolean;
  msg: string;
  obj: T;
};

export type Inbound = {
  id: number;
  up: number;
  down: number;
  total: number;
  remark: string;
  enable: boolean;
  expiryTime: number;
  listen: string;
  port: number;
  protocol: enums.InboundProtocol;
  settings: InboundSettings;
  streamSettings: StreamSettings;
  sniffing: Sniffing;
  allocate: Allocate;
};

export type InboundResponse = Omit<
  Inbound,
  'settings' | 'streamSettings' | 'sniffing' | 'allocate'
> & {
  settings: string;
  streamSettings: string;
  sniffing: string;
  allocate: string;
};

export type AddInbound = Omit<Inbound, 'id'>;

export type AddInboundBody = Omit<InboundResponse, 'id'>;

export type InboundSettings = {
  clients: InboundClient[];
  decryption: string;
  fallbacks: string[];
};

export type InboundClient = {
  id: string;
  flow: string;
  email: string;
  limitIp: number;
  totalGB: number;
  expiryTime: number;
  enable: boolean;
  tgId: string;
  subId: string;
  reset: number;
};

export type AddInboundClientsBody = {
  id: number;
  settings: string;
};

export type UpdateInboundClient = Omit<InboundClient, 'id'>;

export type UpdateInboundClientBody = AddInboundClientsBody;

export type StreamSettings = {
  network: string;
  security: string;
  externalProxy: string[];
  realitySettings: RealitySettings;
  tcpSettings: TcpSettings;
};

export type RealitySettings = {
  show: boolean;
  xver: number;
  dest: string;
  serverNames: string[];
  private_key: string;
  minClient: string;
  maxClient: string;
  maxTimediff: number;
  shortIds: string[];
  settings: RealitySubSettings;
};

export type RealitySubSettings = {
  publicKey: string;
  fingerprint: string;
  serverName: string;
  spiderX: string;
};

export type TcpSettings = {
  acceptProxyProtocol: boolean;
  header: TcpHeader;
};

export type TcpHeader = {
  type: string;
};

export type Sniffing = {
  enabled: boolean;
  destOverride: string[];
  metadataOnly: boolean;
  routeOnly: boolean;
};

export type Allocate = {
  strategy: string;
  refresh: number;
  concurrency: number;
};
