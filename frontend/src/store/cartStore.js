import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  cart: [],

  addToCart: (item) => {
    set((state) => {
      // Create a unique cartId for each item so it's easy to remove later
      const newItem = {
        ...item,
        cartId: crypto.randomUUID(), 
      };
      return { cart: [...state.cart, newItem] };
    });
  },

  removeFromCart: (cartId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.cartId !== cartId)
    }));
  },

  updateQuantity: (cartId, quantity) => {
    if (quantity < 1) return;
    set((state) => ({
      cart: state.cart.map((item) =>
        item.cartId === cartId ? { ...item, cantidad: quantity } : item
      )
    }));
  },

  clearCart: () => set({ cart: [] }),

  getTotal: () => {
    const { cart } = get();
    return cart.reduce((total, item) => {
      const precioBase = Number(item.precioBase || 0);
      const ingredientesTotal = (item.ingredientes || []).reduce((sum, ing) => sum + Number(ing.precio || 0), 0);
      const subtotal = (precioBase + ingredientesTotal) * Number(item.cantidad);
      return total + subtotal;
    }, 0);
  },

  getTotalItems: () => {
    const { cart } = get();
    return cart.reduce((total, item) => total + Number(item.cantidad), 0);
  }
}));
