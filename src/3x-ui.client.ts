import * as types from './types';
import { ApiResponse } from './types';

export class ThreeXUIClient {
  private authCookies: string;

  constructor(
    private readonly baseUrl: string,
    private readonly username: string,
    private readonly password: string,
  ) {}

  private async processResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new Error(
        JSON.stringify({
          status: response.status,
          statusText: response.statusText,
        }),
      );
    }

    if (
      response.headers.get('content-type') !== 'application/json; charset=utf-8'
    ) {
      throw new Error('Incorrect content-type in response');
    }

    const data: ApiResponse<T> = await response.json();

    if (!data.success) {
      throw new Error(data.msg);
    }

    return data.obj;
  }

  private async authorize(): Promise<void> {
    const res = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        username: this.username,
        password: this.password,
      }),
    });

    await this.processResponse(res);

    const authCookies = res.headers.get('set-cookie');

    if (!authCookies) {
      throw new Error(
        JSON.stringify({
          status: 401,
          statusText: 'Unauthorized',
          description: 'Has no auth cookies in response',
        }),
      );
    }

    this.authCookies = authCookies;
  }

  public async getInbounds(): Promise<types.Inbound[]> {
    if (!this.authCookies) {
      await this.authorize();
    }

    const res = await fetch(`${this.baseUrl}/panel/api/inbounds/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: this.authCookies,
      },
    });

    const parsedRes: types.InboundResponse[] = await this.processResponse(res);

    return parsedRes.map((inboundResponse) => ({
      ...inboundResponse,
      settings: JSON.parse(inboundResponse.settings),
      streamSettings: JSON.parse(inboundResponse.streamSettings),
      sniffing: JSON.parse(inboundResponse.sniffing),
      allocate: JSON.parse(inboundResponse.allocate),
    }));
  }

  private async processInboundFromResponse(
    response: Response,
  ): Promise<types.Inbound> {
    const inboundResponse: types.InboundResponse =
      await this.processResponse(response);

    return {
      ...inboundResponse,
      settings: JSON.parse(inboundResponse.settings),
      streamSettings: JSON.parse(inboundResponse.streamSettings),
      sniffing: JSON.parse(inboundResponse.sniffing),
      allocate: JSON.parse(inboundResponse.allocate),
    };
  }

  public async getInbound(id: number): Promise<types.Inbound> {
    if (!this.authCookies) {
      await this.authorize();
    }

    const res = await fetch(`${this.baseUrl}/panel/api/inbounds/get/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: this.authCookies,
      },
    });

    return this.processInboundFromResponse(res);
  }

  public async addInbound(inbound: types.AddInbound): Promise<types.Inbound> {
    if (!this.authCookies) {
      await this.authorize();
    }

    const addInboundBody: types.AddInboundBody = {
      ...inbound,
      settings: JSON.stringify(inbound.settings),
      streamSettings: JSON.stringify(inbound.streamSettings),
      sniffing: JSON.stringify(inbound.sniffing),
      allocate: JSON.stringify(inbound.allocate),
    };

    const res = await fetch(`${this.baseUrl}/panel/api/inbounds/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: this.authCookies,
      },
      body: JSON.stringify(addInboundBody),
    });

    return this.processInboundFromResponse(res);
  }

  public async addClients(
    inboundId: number,
    clients: types.InboundClient[],
  ): Promise<void> {
    if (!this.authCookies) {
      await this.authorize();
    }

    const addClientsBody: types.AddInboundClientsBody = {
      id: inboundId,
      settings: JSON.stringify({
        clients,
      }),
    };

    const res = await fetch(`${this.baseUrl}/panel/api/inbounds/addClient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: this.authCookies,
      },
      body: JSON.stringify(addClientsBody),
    });

    await this.processResponse(res);
  }

  public async updateClient(
    inboundId: number,
    clientId: string,
    client: types.UpdateInboundClient,
  ): Promise<void> {
    if (!this.authCookies) {
      await this.authorize();
    }

    const updateClientsBody: types.UpdateInboundClientBody = {
      id: inboundId,
      settings: JSON.stringify({
        clients: [client],
      }),
    };

    const res = await fetch(
      `${this.baseUrl}/panel/api/inbounds/updateClient/${clientId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Cookie: this.authCookies,
        },
        body: JSON.stringify(updateClientsBody),
      },
    );

    await this.processResponse(res);
  }
}
