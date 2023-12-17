import axios from 'axios';

export class SuplaDirectLinkRequestHandler{
  public static async getDoorState(host: string, id: string, password: string): Promise<DoorState> {
    const url = `${host}/direct/${id}`;
    return axios.patch(url, {
      'code': password,
      'action': 'read',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }).then((response) => {
      return response.data.hi === true ? DoorState.CLOSED : DoorState.OPEN;
    }).catch((error) => {
      return error;
    });
  }

  public static async setDoorState(host: string, id: string, password: string): Promise<boolean> {
    const url = `${host}/direct/${id}`;
    return axios.patch(url, {
      'code': password,
      'action': 'open-close',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }).then((response) => {
      return response.data.success;
    }).catch((error) => {
      return error;
    });
  }

  public static async getLightState(host: string, id: string, password: string): Promise<LightState> {
    const url = `${host}/direct/${id}`;
    return axios.patch(url, {
      'code': password,
      'action': 'read',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }).then((response) => {
      return response.data.hi === true ? LightState.ON : LightState.OFF;
    }).catch((error) => {
      return error;
    });
  }

  public static async setLightState(host: string, id: string, password: string): Promise<boolean> {
    const url = `${host}/direct/${id}`;
    return axios.patch(url, {
      'code': password,
      'action': 'toggle',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }).then((response) => {
      return response.data.success;
    }).catch((error) => {
      return error;
    });
  }
}

export enum DoorState {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
    UNKNOWN = 'UNKNOWN',
}

export enum LightState {
    ON = 'ON',
    OFF = 'OFF',
    UNKNOWN = 'UNKNOWN',
}