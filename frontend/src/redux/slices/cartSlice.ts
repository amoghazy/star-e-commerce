import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import IProduct from "../../types/IProduct";
import { updateCart } from "../../utils/cart";
const initialState = localStorage.getItem("cart")
  ? JSON.parse(localStorage.getItem("cart") as string)
  : {
      cartItems: [],

      paymentMethod: "",
      shippingAddress: {
        address: "",
        city: "",
        postalCode: "",
        country: "",
      },
    };
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<IProduct>) {
      const product = action.payload;

      const itemIndex = state.cartItems.findIndex(
        (item: IProduct) => item._id === product._id
      );
      if (itemIndex >= 0) {
        toast.info("Item already in cart", {
          position: "bottom-left",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        state.cartItems.push(product);
        toast.success("Item added to cart", {
          position: "bottom-left",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

      updateCart(state);
    },
    removeFromCart(state, action) {
      const nextCartItems = state.cartItems.filter(
        (cartItem: IProduct) => cartItem._id !== action.payload._id
      );
      state.cartItems = nextCartItems;
      updateCart(state);
    },
    saveShippingAddress(state, action) {
      state.shippingAddress = action.payload;
      localStorage.setItem("cart", JSON.stringify(state));
    },
    savePaymentMethod(state, action) {
      state.paymentMethod = action.payload;
      localStorage.setItem("cart", JSON.stringify(state));
    },
    clearCart(state) {
      state.cartItems = [];
      updateCart(state);
      localStorage.setItem("cart", JSON.stringify(state));
    },
    resetCart(state) {
      state = initialState;
      localStorage.setItem("cart", JSON.stringify(state));
    },
    updateCountPices(state, action) {
      const itemIndex = state.cartItems.findIndex(
        (item: IProduct) => item._id === action.payload._id
      );
      state.cartItems[itemIndex].countPices = action.payload.countPices;
      updateCart(state);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
  updateCountPices,
  resetCart,
} = cartSlice.actions;
export default cartSlice.reducer;
