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
    const availableStock = product?.stock !== undefined && product?.stock !== null ? Number(product.stock) : 99;

    if (availableStock <= 0) {
      alert(`Désolé, l'article « ${product.nom} » est actuellement en rupture de stock.`);
      return;
    }

    setCartItems(prevItems => {
      const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;
      const existingIndex = prevItems.findIndex(item => item.cartItemId === cartItemId);

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].quantity;
        const newQty = Math.min(availableStock, currentQty + quantity);
        if (currentQty >= availableStock) {
          alert(`Quantité maximale en stock atteinte (${availableStock} disponible(s)).`);
          return prevItems;
        }
        const updated = [...prevItems];
        updated[existingIndex].quantity = newQty;
        updated[existingIndex].stock = availableStock;
        return updated;
      } else {
        const initialQty = Math.min(availableStock, Math.max(1, quantity));
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
            quantity: initialQty,
            stock: availableStock,
            marketId: product.marketId || (product.categoryObj?.market?.id) || (typeof product.category === 'object' ? product.category?.market?.id : null) || 'vestimentaire'
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
          const maxStock = item.stock !== undefined && item.stock !== null ? item.stock : 99;
          if (delta > 0 && item.quantity >= maxStock) {
            alert(`Stock maximum disponible atteint pour cet article (${maxStock} unité(s)).`);
            return item;
          }
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: Math.min(maxStock, newQty) } : null;
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
