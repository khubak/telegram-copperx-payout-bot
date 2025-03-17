import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ApiService {
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const baseUrl = this.configService.get<string>('copperxApi.baseUrl');
    if (!baseUrl) {
      throw new Error('API base URL is not configured');
    }
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    // This will be implemented later to retrieve the token from session storage
    return null;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const headers = this.getAuthHeaders();
      const response = await firstValueFrom<AxiosResponse<T>>(
        this.httpService
          .get<T>(`${this.baseUrl}${url}`, { ...config, headers })
          .pipe(catchError(this.handleError)),
      );
      return response.data;
    } catch (error) {
      this.handleException(error);
      throw error; // This line will never be reached due to the above line, but TypeScript needs it
    }
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const headers = this.getAuthHeaders();
      const response = await firstValueFrom<AxiosResponse<T>>(
        this.httpService
          .post<T>(`${this.baseUrl}${url}`, data, { ...config, headers })
          .pipe(catchError(this.handleError)),
      );
      return response.data;
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const headers = this.getAuthHeaders();
      const response = await firstValueFrom<AxiosResponse<T>>(
        this.httpService
          .put<T>(`${this.baseUrl}${url}`, data, { ...config, headers })
          .pipe(catchError(this.handleError)),
      );
      return response.data;
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  private getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private handleError(error: AxiosError) {
    throw error;
  }

  private handleException(error: unknown) {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      throw new InternalServerErrorException(
        `API request failed with status ${status}: ${message}`,
      );
    }

    throw new InternalServerErrorException('An unexpected error occurred');
  }
}
