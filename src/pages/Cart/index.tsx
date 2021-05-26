import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount, clearCart, submitOrder } = useCart();

  const cartFormatted = cart
    .map(product => ({
      ...product,
      priceFormatted: formatPrice(product.price),
      subTotal: product.amount * product.price,
    }))
    .sort((a, b) => a.id - b.id);
  const total =
    formatPrice(cartFormatted.reduce((sumTotal, product) => sumTotal + product.subTotal, 0));

  function handleProductIncrement(product: Product) {
    updateProductAmount({
      productId: product.id,
      amount: product.amount + 1,
    });
  }

  function handleProductDecrement(product: Product) {
    updateProductAmount({
      productId: product.id,
      amount: product.amount - 1,
    });
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  function handleClearCart() {
    clearCart();
  }

  function handleSubmitOrder() {
    submitOrder();
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {
            cartFormatted.length === 0 && (
              <tr>
                <td colSpan={5}>Seu carrinho está vazio   :(</td>
              </tr>
            )
          }
          {
            cartFormatted.map((product) => (
              <tr data-testid="product" key={product.id}>
                <td>
                  <img src={product.image} alt={product.title} />
                </td>
                <td>
                  <strong>{product.title}</strong>
                  <span>{product.priceFormatted}</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                      disabled={product.amount <= 1}
                      onClick={() => handleProductDecrement(product)}
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type="text"
                      data-testid="product-amount"
                      readOnly
                      value={product.amount}
                    />
                    <button
                      type="button"
                      data-testid="increment-product"
                      onClick={() => handleProductIncrement(product)}
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>{formatPrice(product.subTotal)}</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                    onClick={() => handleRemoveProduct(product.id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </ProductTable>

      <footer>
        <button
          type="button"
          disabled={cartFormatted.length === 0}
          onClick={handleSubmitOrder}
        >
          Finalizar pedido
        </button>
        {
          cartFormatted.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
            >
              Limpar carrinho
            </button>
          )
        }

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
