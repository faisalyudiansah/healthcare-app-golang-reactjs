import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import AdminProtected from '@/components/outlets/AdminProtected';
import Dashboard from '@/features/admin/Dashboard';
import axios, { AxiosError } from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { getAuthState } from '@/store/authentication/authSlice';
import { useLayoutEffect } from 'react';
import ProductsOutlet from './components/outlets/ProductsOutlet';
import Products from './features/admin/Products';
import AddProduct from './features/admin/AddProduct';
import ProductDetails from './features/admin/ProductDetails';
import PharmacistsOutlet from './components/outlets/PharmacistsOutlet';
import Pharmacists from './features/admin/Pharmacists';
import AddPharmacist from './features/admin/AddPharmacist';
import PharmaciesOutlet from './components/outlets/PharmaciesOutlet';
import Pharmacies from './features/admin/Pharmacies';
import Toast from './components/ui/Toast';
import Partners from './features/admin/Partners';
import PartnersOutlet from './components/outlets/PartnersOutlet';
import MainEntry from './features/mainEntry';
import OrdersOutlet from './components/outlets/OrdersOutlet.tsx';
import Orders from './features/admin/Orders';
import PharmacistOrders from './features/pharmacist/pages/Orders/index.tsx';
import PharmacistPharmacies from './features/pharmacist/Pharmacies/index.tsx';
import NotFound from './NotFound.tsx';
import PharmacyDetails from './features/pharmacist/PharmacyDetails/index.tsx';
import Login from './features/mainEntry/Login.tsx';
import AuthOutlet from '@auth-kit/react-router/AuthOutlet';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import { showToastAsync } from './store/toast/toastSlice.ts';

import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import { useCookies } from 'react-cookie';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { IUser } from './models/Users.ts';
import Coba from './Coba.tsx';

// const queryClient = new QueryClient();

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector(getAuthState);
  const user = useAuthUser<IUser>();
  const navigate = useNavigate();
  const signOut = useSignOut();

  const isAuthenticated = useIsAuthenticated();
  const [cookies] = useCookies(['_auth']);

  // intercept request on [token]
  useLayoutEffect(() => {
    const authInterceptor = axios.interceptors.request.use((req) => {
      if (authState.dauHieu) {
        const token = authState.dauHieu;
        req.headers.Authorization = `Bearer ${token}`;
        req.withCredentials = false;
      } else if (isAuthenticated) {
        req.headers.Authorization = `Bearer ${cookies._auth}`;
        req.withCredentials = true;
      }

      return req;
    });

    return () => {
      axios.interceptors.request.eject(authInterceptor);
    };
  }, [isAuthenticated, authState.dauHieu]);

  // intercept response for auto logout on error
  useLayoutEffect(() => {
    const i = axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error) {
          if ((error as AxiosError).status === 401) {
            signOut();
            dispatch(
              showToastAsync({ message: 'Please login', type: 'warning' }),
            );
            navigate('/login'); // redirect back to login
          } else {
            return Promise.reject(error); // pass errors thrown into catch()
          }
        }
      },
    );

    return () => {
      axios.interceptors.response.eject(i);
    };
  }, [dispatch, navigate]);

  return (
    <>
      <Toast />

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="" element={<AuthOutlet fallbackPath={'/login'} />}>
          <Route path="" element={<MainEntry />}>
            <Route path="" element={<AdminProtected />}>
              {/* ... /dashboard */}
              <Route path="" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* ... /products */}
              <Route path="products" element={<ProductsOutlet />}>
                <Route path="" element={<Products />} />

                {/* ... /products/add */}
                <Route path="add" element={<AddProduct />} />

                {/* ... /products/:id */}
                <Route path=":productId" element={<ProductDetails />} />
              </Route>

              {/* /pharmacists */}
              <Route path="pharmacists" element={<PharmacistsOutlet />}>
                <Route path="" element={<Pharmacists />} />
                <Route path="add" element={<AddPharmacist />} />
              </Route>

              {/* /partners */}
              <Route path="partners" element={<PartnersOutlet />}>
                <Route path="" element={<Partners />} />
              </Route>

              {/* /pharmacies */}
              <Route path="pharmacies" element={<PharmaciesOutlet />}>
                <Route
                  path=""
                  element={
                    user?.role === 'pharmacist' ? (
                      <PharmacistPharmacies />
                    ) : (
                      <Pharmacies />
                    )
                  }
                />
                <Route path=":pharmacyId" element={<PharmacyDetails />} />
              </Route>

              {/* /orders */}
              <Route path="orders" element={<OrdersOutlet />}>
                <Route
                  path=""
                  element={
                    user?.role === 'pharmacist' ? (
                      <PharmacistOrders />
                    ) : (
                      <Orders />
                    )
                  }
                />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
        <Route path="coba" element={<Coba />} />
      </Routes>
    </>
  );
}

export default App;
/*
 
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
*/
