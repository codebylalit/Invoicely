export const mockBankDetails = [
  {
    id: 1,
    bankName: "Wells Fargo",
    accountName: "Design Studio",
    accountNumber: "9876543210",
    routingNumber: "121000248",
    swiftCode: "WFBIUS6S",
    iban: "US12 1210 0024 8987 6543 2100",
    currency: "USD",
    isDefault: true,
  },
  {
    id: 2,
    bankName: "Chase Bank",
    accountName: "Design Studio Business",
    accountNumber: "1234567890",
    routingNumber: "021000021",
    swiftCode: "CHASUS33",
    iban: "US02 0210 0002 1123 4567 8900",
    currency: "USD",
    isDefault: false,
  },
  {
    id: 3,
    bankName: "Bank of America",
    accountName: "Design Studio LLC",
    accountNumber: "4567890123",
    routingNumber: "026009593",
    swiftCode: "BOFAUS3N",
    iban: "US02 0260 0959 3456 7890 1230",
    currency: "USD",
    isDefault: false,
  },
];

export const mockPaymentInstructions = {
  bankTransfer: "Please include invoice number in the payment reference. International transfers may incur additional fees.",
  check: "Make checks payable to Design Studio and mail to: 456 Creative Lane, Austin, TX 78701",
  wireTransfer: "For international wire transfers, please use the SWIFT code and include all bank details.",
  ach: "For ACH transfers, use the routing and account numbers provided.",
}; 