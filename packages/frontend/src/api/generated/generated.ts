/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Error {
  error: string;
}

/**
 * Book
 * A book from the Atelier library, imported from the Open Library API.
 */
export interface Book {
  /** Open Library work ID of the book, e.g. "OL675783W". */
  id: string;
  /** Title of the book. */
  title: string;
  /** Author of the book. */
  author: string;
  /** Language of the book. */
  language: "en" | "de";
  /** URL of a cover image from Open Library. Optional. */
  coverUrl?: string;
}

/**
 * FavoriteBook
 * A book on the shared shelf, with how often visitors picked it.
 */
export interface FavoriteBook {
  /** A book from the Atelier library, imported from the Open Library API. */
  book: Bookbook;
  /** Number of visitors who picked this book as a favorite. */
  count: number;
  /**
   * RFC 3339 timestamp in UTC of the latest pick. The frontend converts this to UTC+1 for display, per AGENTS.md section 13.
   * @format date-time
   */
  lastAddedAt: string;
}

/**
 * Book
 * A book from the Atelier library, imported from the Open Library API.
 */
export interface Bookbook {
  /** Open Library work ID of the book, e.g. "OL675783W". */
  id: string;
  /** Title of the book. */
  title: string;
  /** Author of the book. */
  author: string;
  /** Language of the book. */
  language: "en" | "de";
  /** URL of a cover image from Open Library. Optional. */
  coverUrl?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://localhost:8080",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Atelier API
 * @version 0.1.0
 * @baseUrl http://localhost:8080
 *
 * HTTP API for the Atelier shelf of favorite feminist books.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  health = {
    /**
     * No description
     *
     * @name GetHealth
     * @summary Check backend health
     * @request GET:/health
     */
    getHealth: (params: RequestParams = {}) =>
      this.request<
        {
          status: "ok";
        },
        any
      >({
        path: `/health`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  catalog = {
    /**
     * @description The library holds 50 English and 50 German books imported from the Open Library API. Matches title and author. Without a query, the first 20 books ordered by title are returned.
     *
     * @name SearchCatalog
     * @summary Search the library of 100 feminist books
     * @request GET:/catalog
     */
    searchCatalog: (
      query?: {
        q?: string;
        language?: "en" | "de";
      },
      params: RequestParams = {},
    ) =>
      this.request<Book[], any>({
        path: `/catalog`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  favorites = {
    /**
     * No description
     *
     * @name ListFavorites
     * @summary List the shared shelf, most recently picked first
     * @request GET:/favorites
     */
    listFavorites: (params: RequestParams = {}) =>
      this.request<FavoriteBook[], any>({
        path: `/favorites`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name AddFavorite
     * @summary Pick a book from the library as a favorite
     * @request POST:/favorites
     */
    addFavorite: (
      data: {
        /** Open Library work ID of a book from the library. */
        bookId: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<FavoriteBook, Error>({
        path: `/favorites`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
