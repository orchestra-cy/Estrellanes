export interface ChangePassDOT {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserInfo {
  status: string;
  user: UserDetails;
}

export interface UserDetails {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  disable: null | string | boolean;
  roles: string[];
}

// export interface UserLoginResult {
//   ok : boolean,
//   data : {
//     token: string,
//     user: {
//       id: number,
//       name: string,
//       email: string
//     }
//   }
// };

export interface UserLoginResult {
  ok: boolean;
  status: number;
  token: string;
  error?: string
  data?: string | undefined
}
