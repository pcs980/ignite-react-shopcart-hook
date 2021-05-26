import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
  submitOrder: () => void;
  clearCart: () => void;
}

const STORAGE_ITEM = '@RocketShoes:cart';

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem(STORAGE_ITEM);

    if (storagedCart) {
      const parsedCart = JSON.parse(storagedCart);
      return parsedCart;
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      let alreadyInCart = false;
      let amount = 1;

      // check cart
      let product = cart.find((product) => product.id === productId);
      if (product) {
        alreadyInCart = true;
        amount += product.amount;
      // get product data
      } else {
        const productResult = await api.get(`/products/${productId}`);
        product = productResult.data;
      }

      if (!product) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      // check stock
      const stockResult = await api.get(`/stock/${productId}`);
      const stock: Stock = stockResult.data;

      if (!stock || stock.amount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const newCart = [
        ...cart.filter((product) => product.id !== productId),
        { ...product, amount }
      ];
      setCart(newCart);
      localStorage.setItem(STORAGE_ITEM, JSON.stringify(newCart));

      toast.success(alreadyInCart ? 'Produto atualizado' : 'Produto adicionado');
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const isInCart = cart.some((product) => product.id === productId);
      if (!isInCart) {
        throw new Error('PRODUCT_NOT_IN_CART');
      }
      const newCart = cart.filter((product) => product.id !== productId);
      setCart(newCart);
      localStorage.setItem(STORAGE_ITEM, JSON.stringify(newCart));
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {

      if (amount < 1) {
        throw new Error('INVALID_AMOUNT');
      }

      // check cart
      let product = cart.find((product) => product.id === productId);
      if (!product) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      // check stock
      const stockResult = await api.get(`/stock/${productId}`);
      const stock: Stock = stockResult.data;

      if (!stock || stock.amount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const newCart = [
        ...cart.filter((product) => product.id !== productId),
        { ...product, amount }
      ];
      setCart(newCart);
      localStorage.setItem(STORAGE_ITEM, JSON.stringify(newCart));
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  const submitOrder = () => {
    try {
      setCart([]);
      localStorage.setItem(STORAGE_ITEM, JSON.stringify([]));
      toast.info('Pedido finalizado! Obrigado!');
    } catch {
      toast.error('Erro ao fechar pedido');
    }
  }

  const clearCart = () => {
    try {
      setCart([]);
      localStorage.setItem(STORAGE_ITEM, JSON.stringify([]));
    } catch {
      toast.error('Erro ao limpar o carrinho');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount, submitOrder, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
