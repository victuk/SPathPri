export const normalizePhoneNumber = (phoneNumber: string): string => {
    let p: string;
  if (phoneNumber[0] == "0") {
    p = "234" + phoneNumber.toString().slice(1);
  } else if (phoneNumber[0] == "+") {
    p = phoneNumber.toString().slice(1);
  } else if(phoneNumber.slice(0, 3) == "234") {
    p = phoneNumber;
  } else {
    throw new Error("Invalid phone number");
  }
  return p;
};
