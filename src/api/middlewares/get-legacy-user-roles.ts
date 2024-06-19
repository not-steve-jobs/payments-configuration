interface JWTBody {
  aud?: string;
  sub: string;
  email: string;
  name: string;
  roles?: string[];
  exp: number;
}

export const getLegacyUserRoles = (authHeader: string | undefined): string[] | null => {
  if (!authHeader) {
    return null;
  }

  const [authType, jwt] = authHeader.split(' ');
  if (authType !== 'Bearer' || !jwt) {
    return null;
  }

  const jwtBodyEncoded: string | undefined = jwt.split('.')[1];
  if (!jwtBodyEncoded) {
    return null;
  }

  const body: JWTBody = JSON.parse(Buffer.from(jwtBodyEncoded, 'base64').toString());
  // It means that we obtain azure token (not legacy token)
  if (body.aud) {
    return null;
  }

  return body.roles ?? [];
};
