import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Routes from './routes';
import GlobalStyles from './styles/global';
import Header from './components/Header';
import { CartProvider } from './hooks/useCart';

const App = (): JSX.Element => {
  return (
    <BrowserRouter>
      <CartProvider>
        <GlobalStyles />
        <Header />
        <Routes />
        {/* change position to avoid cart icon get covered by toast */}
        <ToastContainer autoClose={3000} position='top-center' />
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;
