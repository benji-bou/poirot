import { KeySharp } from '@mui/icons-material';
import { isDate, isMobilePhone, isPostalCode } from 'validator';
import isEmail from 'validator/lib/isEmail';
import isFQDN from 'validator/lib/isFQDN';
import isURL from 'validator/lib/isURL';


export enum IntelType {
  NAME = "name",
  LOGIN = "login",
  PASSWORD = "password",
  EMAIL = "email",
  DATE = "date",
  URL = "url",
  DOMAIN = "domain",
  POSTAL = "postal",
  ADDRESS = "address",
  PHONE = "phone",
  LINKEDIN = "linkedin",
  ACCOUNT = "account",
  CUSTOM = "custom",
}



export type IntelInput = string

export class IntelTypeIndex {
  [id: string]: IntelTypeValidator;

  public static fromTypeKey(...key: string[]): IntelTypeIndex {
    return key.reduce<IntelTypeIndex>((p, c) => { p[c] = IntelTypeStore.all[c]; return p }, {})
  }
}

export class IntelTypeCustomStore {
  all: IntelTypeIndex = {
    [IntelType.NAME]: (input: IntelInput) => {
      return false
    },
    [IntelType.LOGIN]: (input: IntelInput) => {
      return false
    },
    [IntelType.PASSWORD]: (input: IntelInput) => {
      return false
    },
    [IntelType.EMAIL]: (input: IntelInput) => {
      return isEmail(input)
    },
    [IntelType.DATE]: (input: IntelInput) => {
      return isDate(input)
    },
    [IntelType.URL]: (input: IntelInput) => {
      return isURL(input)
    },
    [IntelType.DOMAIN]: (input: IntelInput) => {
      return isFQDN(input)
    },
    [IntelType.POSTAL]: (input: IntelInput) => {
      return isPostalCode(input, 'any')
    },
    [IntelType.ADDRESS]: (input: IntelInput) => {
      return false
    },

    [IntelType.PHONE]: (input: IntelInput) => {
      return isMobilePhone(input)
    },
    [IntelType.CUSTOM]: (input: IntelInput) => {
      return false
    },
    [IntelType.ACCOUNT]: (input: IntelInput) => {
      return false
    },

    [IntelType.LINKEDIN]: (input: IntelInput) => {
      if (isURL(input, { host_whitelist: [RegExp(".*\.linkedin.com")] })) {
        return true
      }
      return false
    }
  }

  addCustomType(type: string, validator: (input: IntelInput) => boolean = () => true) {
    this.all[type] = validator
  }
  public bestMatchs(input: IntelInput): string[] {
    const res: string[] = [];
    for (const validator of Object.keys(this.all)) {
      if (this.all[validator](input)) {
        res.push(validator)
      }
    }
    if (res.length == 0) {
      res.push(IntelType.CUSTOM)
    }
    return res;
  }

}


export type IntelTypeValidator = (input: IntelInput) => boolean

export const IntelTypeStore = new IntelTypeCustomStore()

export type Intel = {
  name?: string
  description?: string
  content: IntelInput
  type: string[]
}



export function NewIntel(input: IntelInput, name?: string, description?: string, ...type: string[]) {
  const types = IntelTypeStore.bestMatchs(input)
  const otherTypes = IntelTypeIndex.fromTypeKey(...type)
  return { name: name, description: description, content: input, type: [...types, ...Object.keys(otherTypes)] }
}

