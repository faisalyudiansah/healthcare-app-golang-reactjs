import moment from 'moment';

export const NormalizeSnakeCase = (s: string) => {
  return s
    .replaceAll('-', ' ')
    .toLowerCase()
    .split(' ')
    .map((word: string) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

export const ToLocaleDateFormatted = (dateString: string): string => {
  return moment(dateString).format('LL');
};

export const ToLocaleDateFormattedSlash = (dateString: string): string => {
  return moment(dateString).format('DD/MM/yyyy');
};

export const Replace62Code = (phoneNum: string): string => {
  return phoneNum.replace('+62', '08').replaceAll('+', '');
};

export const ConvertActiveStatus = (status: boolean): string => {
  return status ? 'Active' : 'Inactive';
};

interface ParsedAddress {
  address: string;
  subdistrict: string;
  district: string;
}

export const AddressParser = (address: string): ParsedAddress => {
  const parts = address.split(',');

  const cleanedParts = parts.map((part) => part.trim());

  const parsedAddress: ParsedAddress = {
    address: cleanedParts[0] || '',
    subdistrict: cleanedParts[1] || '',
    district: cleanedParts[2] || '',
  };

  return parsedAddress;
};

export const NameParser = (input: string, delimiter: string): string => {
  let address = delimiter.split(' ')
  address.shift()
  return input.split(` ${address.join(' ')} `)[1]
};

export const isPrevParams = (input: string): string => {
  const regex = /\?/;
  if  (regex.test(input)) {
    return '&'
  }
  return '?'
}
