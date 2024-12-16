export const validatePhoneNumber = (phone: string): boolean => {
    const indonesianPhoneRegex = /^(?:\+62|62|0)[2-9]{1}[0-9]{7,11}$/;
    return indonesianPhoneRegex.test(phone);
};