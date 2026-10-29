import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext.js';
import { CartProvider } from './contexts/CartContext.js';
import { WishlistProvider } from './contexts/WishlistContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { CartDrawer } from './components/cart/CartDrawer.js';

// Pages
import { HomePage } from './pages/HomePage.js';
import { ProductsPage } from './pages/ProductsPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { CartPage } from './pages/CartPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderSuccessPage } from './pages/OrderSuccessPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { AccountPage } from './pages/AccountPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { PrivacyPage } from './pages/PrivacyPage.js';
import { TermsPage, ShippingPolicyPage, ReturnsPolicyPage } from './pages/PolicyPages.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

  // Navigation handler that updates browser history
  const navigate = (pathWithQuery: string) => {
    const [path, queryString] = pathWithQuery.split('?');
    window.history.pushState({}, '', pathWithQuery);
    setCurrentPath(path);
    setSearchParams(new URLSearchParams(queryString || ''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Simple, robust router
  const renderPage = () => {
    // 1. Home
    if (currentPath === '/' || currentPath === '') {
      return <HomePage navigate={navigate} />;
    }

    // 2. Product Detail: /products/:idOrSlug
    if (currentPath.startsWith('/products/') && currentPath !== '/products/new') {
      const slug = currentPath.replace('/products/', '');
      return <ProductDetailPage productIdOrSlug={slug} navigate={navigate} />;
    }

    // 3. Category catalog: /categories/:slug
    if (currentPath.startsWith('/categories/')) {
      const categorySlug = currentPath.replace('/categories/', '');
      const params = new URLSearchParams(searchParams);
      params.set('category', categorySlug);
      return <ProductsPage navigate={navigate} searchParams={params} />;
    }

    // 4. Products / Search catalog
    if (currentPath === '/products' || currentPath === '/search') {
      return <ProductsPage navigate={navigate} searchParams={searchParams} />;
    }

    // 5. Cart
    if (currentPath === '/cart') {
      return <CartPage navigate={navigate} />;
    }

    // 6. Checkout
    if (currentPath === '/checkout') {
      return <CheckoutPage navigate={navigate} />;
    }

    // 7. Order Success
    if (currentPath === '/order-success') {
      return <OrderSuccessPage navigate={navigate} searchParams={searchParams} />;
    }

    // 8. Auth
    if (currentPath === '/login') {
      return <LoginPage navigate={navigate} />;
    }
    if (currentPath === '/register') {
      return <RegisterPage navigate={navigate} />;
    }
    if (currentPath === '/forgot-password') {
      return <ForgotPasswordPage navigate={navigate} />;
    }

    // 9. Customer Account
    if (currentPath.startsWith('/account')) {
      if (currentPath === '/account/orders' || currentPath.startsWith('/account/orders/')) {
        const orderId = currentPath.replace('/account/orders/', '').replace('/account/orders', '');
        return <AccountPage navigate={navigate} tab="orders" orderId={orderId || undefined} />;
      }
      if (currentPath === '/account/addresses') {
        return <AccountPage navigate={navigate} tab="addresses" />;
      }
      if (currentPath === '/account/wishlist') {
        return <AccountPage navigate={navigate} tab="wishlist" />;
      }
      return <AccountPage navigate={navigate} tab="profile" />;
    }

    // 10. Admin
    if (currentPath.startsWith('/admin')) {
      if (currentPath === '/admin/products') {
        return <AdminDashboardPage navigate={navigate} subtab="products" />;
      }
      if (currentPath === '/admin/orders') {
        return <AdminDashboardPage navigate={navigate} subtab="orders" />;
      }
      if (currentPath === '/admin/customers') {
        return <AdminDashboardPage navigate={navigate} subtab="customers" />;
      }
      return <AdminDashboardPage navigate={navigate} subtab="overview" />;
    }

    // 11. Policies and Informational
    if (currentPath === '/about') {
      return <AboutPage navigate={navigate} />;
    }
    if (currentPath === '/contact') {
      return <ContactPage navigate={navigate} />;
    }
    if (currentPath === '/privacy') {
      return <PrivacyPage navigate={navigate} />;
    }
    if (currentPath === '/terms') {
      return <TermsPage navigate={navigate} />;
    }
    if (currentPath === '/shipping-policy') {
      return <ShippingPolicyPage navigate={navigate} />;
    }
    if (currentPath === '/returns-policy') {
      return <ReturnsPolicyPage navigate={navigate} />;
    }

    // 404
    return <NotFoundPage navigate={navigate} />;
  };

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-screen flex flex-col bg-[#fafbfc] text-slate-900 selection:bg-indigo-500 selection:text-white">
            <Navbar currentPath={currentPath} navigate={navigate} />
            <main className="flex-1">
              {renderPage()}
            </main>
            <CartDrawer navigate={navigate} />
            <Footer navigate={navigate} />
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
