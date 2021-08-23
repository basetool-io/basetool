import { apiUrl, baseUrl } from "@/features/api/urls";
import { toast } from "react-toastify";
import ApiResponse, { ApiResponseMessage } from "@/features/api/ApiResponse";
import Router from "next/router";
import axios from "axios";
import DataQuery from "../data-sources/types";

const appArgs = {
  baseURL: baseUrl,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
};

export const reactToResponse = (data: any) => {
  if (data) {
    const { messages, redirectTo, reload } = data;

    if (messages) {
      (data?.messages as ApiResponseMessage[]).map((message) =>
        message.type ? toast[message.type](message.message) : toast(message)
      );
    }
    if (reload) {
      Router.reload();
    }
    if (redirectTo) {
      Router.push(redirectTo);
    }
  }
};

export const reactToError = (data: any) => {
  if (data) {
    const { messages } = data;

    if (messages) {
      (data?.messages as ApiResponseMessage[]).map((message) =>
        message.type
          ? toast[message.type](message.message)
          : toast.error(message)
      );
    }
  }
};

const Api = axios.create(appArgs);

Api.interceptors.response.use(
  (response) => {
    const { data }: { data: ApiResponse } = response;
    reactToResponse(data);

    return response;
  },
  // eslint-disable-next-line consistent-return
  (error) => {
    const { response } = error;
    if (response) {
      const { data } = response;
      reactToError(data);

      return Promise.reject(error);
    }
  }
);

export { Api };

class ApiService {
  public apiUrl = apiUrl;

  /* Apps */
  public async getApp(appId: number): Promise<ApiResponse> {
    const { data } = await Api.get(`${this.apiUrl}/apps/${appId}`);

    return data;
  }

  public async getApps(): Promise<ApiResponse> {
    const { data } = await Api.get(`${this.apiUrl}/apps`);

    return data;
  }

  public async createApp(payload: { name: string }): Promise<ApiResponse> {
    const { data } = await Api.post(`${this.apiUrl}/apps`, payload);

    return data;
  }

  public async updateApp(id: number, payload: {}): Promise<ApiResponse> {
    const { data } = await Api.put(`${this.apiUrl}/apps/${id}`, payload);

    return data;
  }

  public async deleteApp(id: number): Promise<ApiResponse> {
    const { data } = await Api.delete(`${this.apiUrl}/apps/${id}`);

    return data;
  }

  public async getAppVersion(versionId: number): Promise<ApiResponse> {
    const { data } = await Api.get(`${this.apiUrl}/app-versions/${versionId}`);

    return data;
  }

  /* DataQueries */
  public async createDataQuery(
    appId: number,
    payload: DataQuery
  ): Promise<ApiResponse> {
    const { data } = await Api.post(
      `${this.apiUrl}/apps/${appId}/data-queries`,
      payload
    );

    return data;
  }

  public async runQuery(
    appId: number,
    queryId: number,
    payload?: object
  ): Promise<ApiResponse> {
    const { data } = await Api.post(
      `${this.apiUrl}/apps/${appId}/data-queries/${queryId}/run`,
      {
        payload,
      }
    );

    return data;
  }

  public async deleteDataQuery(queryId: number): Promise<ApiResponse> {
    const { data } = await Api.delete(`${this.apiUrl}/data-queries/${queryId}`);

    return data;
  }

  public async getDataQueries(appId: number): Promise<ApiResponse> {
    const { data } = await Api.get(`${this.apiUrl}/apps/${appId}/data-queries`);

    return data;
  }

  /* Users */
  public async createUser(payload: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<ApiResponse> {
    const { data } = await Api.post(`${this.apiUrl}/auth/register`, payload);

    return data;
  }

  public async signInUser(payload: {
    email: string;
    password: string;
    csrfToken: string;
  }): Promise<ApiResponse> {
    const { data } = await Api.post(
      `${this.apiUrl}/auth/signin?csrf=true`,
      payload
    );

    return data;
  }

  public async createDataSource(payload: object): Promise<ApiResponse> {
    const { data } = await Api.post(`${this.apiUrl}/data-sources`, payload);

    return data;
  }

  public async updateDataSource(
    id: number,
    payload: object
  ): Promise<ApiResponse> {
    const { data } = await Api.put(
      `${this.apiUrl}/data-sources/${id}`,
      payload
    );

    return data;
  }

  public async updateDataQuery(
    id: number,
    payload: object
  ): Promise<ApiResponse> {
    const { data } = await Api.put(
      `${this.apiUrl}/data-queries/${id}`,
      payload
    );

    return data;
  }

  public async deleteDataSource(id: number): Promise<ApiResponse> {
    const { data } = await Api.delete(`${this.apiUrl}/data-sources/${id}`);

    return data;
  }
}

export default ApiService;
