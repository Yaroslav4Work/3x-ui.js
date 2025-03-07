import { describe } from '@jest/globals';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { types, ThreeXUIClient } from './index';

dotenv.config();

describe('3x-ui client', () => {
  const client = new ThreeXUIClient(
    process.env.BASE_URL,
    process.env.ADMIN_LOGIN,
    process.env.ADMIN_PASSWORD,
  );

  const baseIdentity = Date.now().toString();

  const usedPorts: number[] = [];

  test('get inbounds', async () => {
    const inbounds = await client.getInbounds();

    expect(inbounds).not.toBeUndefined();

    if (inbounds.length > 0) {
      for (const foundInbound of inbounds) {
        usedPorts.push(foundInbound.port);
      }
    }
  });

  let inbound: types.Inbound | undefined;

  test('create inbound', async () => {
    const inboundStubFromFile: Omit<types.InboundResponse, 'id'> = JSON.parse(
      fs.readFileSync(process.env.INBOUND_CONFIG, 'utf8'),
    );

    const inboundStub: types.AddInbound = {
      ...inboundStubFromFile,
      port: Math.max(...usedPorts) + 1,
      remark: baseIdentity,
      settings: JSON.parse(inboundStubFromFile.settings),
      streamSettings: JSON.parse(inboundStubFromFile.streamSettings),
      sniffing: JSON.parse(inboundStubFromFile.sniffing),
      allocate: JSON.parse(inboundStubFromFile.allocate),
    };

    inbound = await client.addInbound(inboundStub);

    expect(inbound).not.toBeUndefined();
    expect(inbound).not.toBeNull();
    expect(inbound.id).not.toBeUndefined();
    expect(inbound.id).not.toBeNull();
    expect(inbound.remark).toEqual(baseIdentity);
  });

  test('get inbound', async () => {
    const idBefore = inbound.id;
    const remarkBefore = inbound.remark;

    inbound = await client.getInbound(inbound.id);

    expect(inbound).not.toBeUndefined();
    expect(inbound.id).toEqual(idBefore);
    expect(inbound.remark).toEqual(remarkBefore);
  });

  test('get inbounds 2', async () => {
    const inbounds = await client.getInbounds();

    const foundInbound = inbounds.find(
      (foundInbound) => foundInbound.id === inbound.id,
    );
    const foundInbound2 = inbounds.find(
      (foundInbound) => foundInbound.remark === inbound.remark,
    );

    expect(inbounds).not.toBeUndefined();
    expect(inbounds.length).toBeGreaterThan(0);
    expect(foundInbound).not.toBeUndefined();
    expect(foundInbound).not.toBeNull();
    expect(foundInbound2).not.toBeUndefined();
    expect(foundInbound2).not.toBeNull();
  });

  let inboundClient: types.InboundClient | undefined;

  const baseClientAssert = async (): Promise<void> => {
    inbound = await client.getInbound(inbound.id);

    expect(inbound).not.toBeUndefined();
    expect(inbound.settings).not.toBeUndefined();
    expect(inbound.settings.clients).not.toBeUndefined();
    expect(inbound.settings.clients.length).toBeGreaterThan(0);
  };

  test('create client', async () => {
    inboundClient = JSON.parse(
      fs.readFileSync(process.env.INBOUND_CONFIG, 'utf8'),
    );

    inboundClient.id = baseIdentity;
    inboundClient.flow = 'xtls-rprx-vision';
    inboundClient.email = `${baseIdentity}:1`;
    inboundClient.tgId = baseIdentity;

    await client.addClients(inbound.id, [inboundClient]);

    await baseClientAssert();

    expect(inbound.settings.clients).toContainEqual(inboundClient);
  });

  test('update client', async () => {
    const dataToUpdate = { ...inboundClient, email: `${baseIdentity}:2` };

    await client.updateClient(inbound.id, inboundClient.id, dataToUpdate);

    await baseClientAssert();

    const foundInboundClient = inbound.settings.clients.find(
      (foundInboundClient) => foundInboundClient.id === inboundClient.id,
    );

    expect(foundInboundClient).not.toBeUndefined();
    expect(foundInboundClient.email).not.toEqual(inboundClient.email);
    expect(foundInboundClient.email).toEqual(dataToUpdate.email);
  });
});
