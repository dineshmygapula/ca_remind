import type { BusinessFormData } from '../types/business';

export const EMPTY_BUSINESS_FORM: BusinessFormData = {
  name: '',
  phone: '',
  businessType: 'GENERAL/Other',
  businessTimeZone: 'India(IST)',
  locale: 'en-IN',
  ownerName: '',
  email: '',
  address: {
    type: 'REGISTERED',
    line1: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    country: 'IN',
  },
};

export const BUSINESS_TYPE_OPTIONS = [
  { value: 'OTHER',     label: 'General / other' },
  { value: 'ACCOUNTS',  label: 'Accounts'        },
  { value: 'RETAIL',    label: 'Retail'          },
  { value: 'WHOLESALE', label: 'Wholesale'       },
  { value: 'SERVICE',   label: 'Service'         },
];

export const BUSINESS_TIME_ZONE_OPTIONS = [
  { value: 'India(IST)', label: 'India(IST)' },
  { value: 'UAE(GST)', label: 'UAE(GST)' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'US Eastern', label: 'US Eastern' },
];