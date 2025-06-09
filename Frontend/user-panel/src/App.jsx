// App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SkeletonLoader from "./components/SkeletonLoader";



export const backendUrl = import.meta.env.VITE_BACKEND_URL;


// Lazy Load Pages for Code Splitting
const Home = lazy(() => import("./pages/Home"));
const Orders = lazy(() => import("./pages/Orders"));
const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const LogOut = lazy(() => import("./pages/LogOut"));
const Profile = lazy(() => import("./pages/Profile"));
const Services = lazy(() => import("./pages/Services"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const Add = lazy(() => import("./pages/Add"));
const RentalRoom = lazy(() => import("./pages/RentalRoom"));
const SingleRoom = lazy(() => import("./pages/SingleRoom"));
const RentalOrder = lazy(() => import("./pages/RentalOrder"));
const Contact = lazy(() => import("./pages/Contact"));
const AddMess = lazy(() => import("./pages/AddMess"));
const SellProducts = lazy(() => import("./pages/SellProducts"));
const AddRoom = lazy(() => import("./pages/AddRoom"));
const AddLaundry = lazy(() => import("./pages/AddLaundry"));
const AddPlumber = lazy(() => import("./pages/AddPlumber"));
const AddMedical = lazy(() => import("./pages/AddMedical"));
const AddElectrician = lazy(() => import("./pages/AddElectrician"));
const Mess = lazy(() => import("./pages/Mess"));
const SingleMess = lazy(() => import("./pages/SingleMess"));
const BookMess = lazy(() => import("./pages/BookMess"));
const MessOrders = lazy(() => import("./pages/MessOrders"));
const Products = lazy(() => import("./pages/Products"));
const SingleProduct = lazy(() => import("./pages/SingleProduct"));
const Cart = lazy(() => import("./pages/Cart"));
const ProductOrders = lazy(() => import("./pages/ProductOrders"));
const PlaceOrder = lazy(() => import("./pages/PlaceOrder"));
const ProductStatus = lazy(() => import("./pages/ProductStatus"));
const MedicalService = lazy(() => import("./pages/MedicalService"));
const SingleMedical = lazy(() => import("./pages/SingleMedical"));
const Laundry = lazy(() => import("./pages/Laundry"));
const SingleLaundry = lazy(() => import("./pages/SingleLaundry"));
const LaundryPlaceOrder = lazy(() => import("./pages/LaundryPlaceOrder"));
const LaundryOrder = lazy(() => import("./pages/LaundryOrder"));
const Electrician = lazy(() => import("./pages/Electrician"));
const SingleElectrician = lazy(() => import("./pages/SingleElectrician"));
const ElectricianPlaceOrder = lazy(() => import("./pages/ElectricianPlaceOrder"));
const ElectricianOrder = lazy(() => import("./pages/ElectricianOrder"));
const Plumber = lazy(() => import("./pages/Plumber"));
const SinglePlumber= lazy(() => import("./pages/SinglePlumber"));
const PlumberPlaceOrder = lazy(() => import("./pages/PlumberPlaceOrder"));
const PlumberOrder = lazy(() => import("./pages/PlumberOrder"));
const VerifyResetOTP = lazy(() => import("./pages/VerifyResetOTP"));
const Launching = lazy(() => import("./pages/Launching"));
const Supercoin = lazy(() => import("./pages/Supercoin"));
const History = lazy(() => import("./pages/History"));

const App = () => {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={7000} />
      <Navbar />
      {/* Suspense with SkeletonLoader as fallback */}
      <Suspense fallback={<SkeletonLoader count={3} />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-reset-otp" element={<VerifyResetOTP />} /> 
          <Route path="/logout" element={<LogOut />} />
          <Route path="/account" element={<Profile />} />
          <Route path="/reviews" element={<Testimonials />} />
          <Route path="/add" element={<Add />} />
          <Route path="/add/mess" element={<AddMess />} />
          <Route path="/add/room" element={<AddRoom />} />
          <Route path="/add/plumber" element={<AddPlumber />} />
          <Route path="/add/electrician" element={<AddElectrician />} />
          <Route path="/add/medical" element={<AddMedical />} />
          <Route path="/add/laundry" element={<AddLaundry />} />
          <Route path="/supercoin" element={<Supercoin/>} />
          <Route path="/launching" element={<Launching />} />
          <Route path="/history" element={<History />} />

          


{/* launching soon */}
          <Route path="/rooms" element={<RentalRoom />} />
          <Route path="/rooms/:id" element={<SingleRoom />} />
          <Route path="/rooms-order" element={<RentalOrder />} />
          <Route path="/mess" element={<Mess />} />
          <Route path="/mess/:id" element={<SingleMess />} />
          <Route path="/mess/payment/:id" element={<BookMess />} />
          <Route path="/mess/orders" element={<MessOrders />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/product/sell-product" element={<SellProducts />} />
          <Route path="/product" element={<Products />} />
          <Route path="/product/:id" element={<SingleProduct />} />
          <Route path="/product/cart" element={<Cart />} />
          <Route path="/product/orders" element={<ProductOrders />} />
          <Route path="/product/placeorder" element={<PlaceOrder />} />
          <Route path="/product/status" element={<ProductStatus />} />
          <Route path="/medical" element={<MedicalService />} />
          <Route path="/medical/:id" element={<SingleMedical />} />
          <Route path="/laundry" element={<Laundry />} />
          <Route path="/laundry/:id" element={<SingleLaundry />} />
          <Route path="/laundry/placeorder/:id" element={<LaundryPlaceOrder />} />
          <Route path="/laundry/orders" element={<LaundryOrder />} />
          <Route path="/electrician" element={<Electrician/>} />
          <Route path="/electrician/:id" element={<SingleElectrician/>} />
          <Route path="/electrician/placeorder/:id" element={<ElectricianPlaceOrder/>} />
          <Route path="/electrician/orders" element={<ElectricianOrder/>} />
          <Route path="/plumber" element={<Plumber/>} />
          <Route path="/Plumber/:id" element={<SinglePlumber/>} />
          <Route path="/Plumber/placeorder/:id" element={<PlumberPlaceOrder/>} />
          <Route path="/Plumber/orders" element={<PlumberOrder/>} />
       


          {/* end launching soon */}

        </Routes>
      </Suspense>
      <Footer />
    </Router>
  );
};

export default App;

