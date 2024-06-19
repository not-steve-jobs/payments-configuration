export interface UpdateCountryAuthorityMethodStatusReqBody {
  isEnabled: boolean;
}

export interface UpdateCountryAuthorityMethodStatusQueryParams {
  methodCode: string;
  authority: string;
  country: string;
}

export interface UpdateCountryAuthorityMethodStatusResponse {
  isEnabled: boolean;
}

export interface UpdateCountryAuthorityMethodStatusServiceParams {
  authority: string;
  country: string;
  methodCode: string;
  isEnabled: boolean;
}
