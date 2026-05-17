export interface LoginDOT {
  username: string,
  password: string,
  onComplete?: () => void // only used for login so optional ra
}

export interface RegisterDOT {
  email: string
  password: string
  username: string
  first_name: string
  last_name: string
  created_at: string
  contact_no: string
}

export interface AuthState {
  error: undefined | null
  isLoading : boolean
  token : string
  userData : string | null
}

export interface LoginGoogleDOT{
  idToken: string,
}

export interface UserInfoDOT {
  status: string,
  user: {
      id: number,
      username: string,
      "firstName": string,
      "lastName": string,
      "email": string,
      disable: null | string | number,
      roles: string[]
  }
  code?:number | null
}