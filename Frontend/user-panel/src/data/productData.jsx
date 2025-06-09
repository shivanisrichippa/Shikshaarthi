import assets from "../assets/assets.js";

export const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 1500,
    uploadDate: "2024-03-01",
    status: "Verified",
    statusDate: "2024-03-02",
    paymentStatus: "Pending",
    image: assets.preown3,
  },
  {
    id: 2,
    name: "Java Programming Book",
    price: 500,
    uploadDate: "2024-02-25",
    status: "Order Placed",
    statusDate: "2024-02-28",
    paymentStatus: "Completed",
    image: assets.preown2,
  },
  {
    id: 3,
    name: "Samsung Galaxy Watch",
    price: 8000,
    uploadDate: "2024-02-20",
    status: "Sold",
    statusDate: "2024-02-25",
    paymentStatus: "Completed",
    image: assets.preown2,
  },
  {
    id: 4,
    name: "HP Laptop",
    price: 45000,
    uploadDate: "2024-02-10",
    status: "Rejected",
    statusDate: "2024-02-12",
    paymentStatus: "N/A",
    image: assets.preown,
  },
];
