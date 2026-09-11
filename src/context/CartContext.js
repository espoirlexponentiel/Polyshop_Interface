import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('7shop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Erreur lecture panier:', e);
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('7shop_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Erreur sauvegarde panier:', e);
    }
  }, [cartItems]);

  const addToCart = (product, selectedSize = 'M', selectedColor = 'Noir', quantity = 1) => {
    setCartItems(prevItems => {
      const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;
      const existingIndex = prevItems.findIndex(item => item.cartItemId === cartItemId);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            cartItemId,
            productId: product.id,
            nom: product.nom,
            prix: product.prix,
            imageUrl: product.imageUrl,
            category: product.category,
            size: selectedSize,
            color: selectedColor,
            quantity: quantity
          }
        ];
      }
    });

    setIsDrawerOpen(true);
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, delta) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.prix * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
