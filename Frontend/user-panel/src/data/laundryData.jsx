import assets from '../assets/assets.js'
const laundryData = [
    {
      id: 1,
      name: "Sparkle Clean Laundry",
      mobile: "9876543210",
      email: "contact@sparkleclean.com",
      address: "123, MG Road",
      pincode: "560001",
      district: "Bangalore",
      state: "Karnataka",
      costPerKg: "50",
      laundryType: "Regular",
      ironing: true,
      returnDays: "2",
      totalAmount: 250,
      images: {
        ownerPhoto: assets.l2,
      },
    },
    {
      id: 2,
      name: "Quick Wash Services",
      mobile: "9876512345",
      email: "info@quickwash.com",
      address: "56, Andheri West",
      pincode: "400053",
      district: "Mumbai",
      state: "Maharashtra",
      costPerKg: "60",
      laundryType: "Express",
      ironing: false,
      returnDays: "1",
      totalAmount: 300,
      images: {
        ownerPhoto: assets.l2,
      },
    },
    {
      id: 3,
      name: "Fresh & Clean Laundry",
      mobile: "9988776655",
      email: "support@freshclean.com",
      address: "78, Anna Salai",
      pincode: "600002",
      district: "Chennai",
      state: "Tamil Nadu",
      costPerKg: "55",
      laundryType: "Delicate",
      ironing: true,
      returnDays: "3",
      totalAmount: 275,
      images: {
        ownerPhoto: assets.l3,
      },
    },
  ];
  
  export default laundryData;
  