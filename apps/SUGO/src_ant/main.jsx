import React from 'react'
import ReactDOM from 'react-dom/client'
// Styles
import './index.css'
// prime core
import "primereact/resources/primereact.min.css";
// prime style (flex)
import "/node_modules/primeflex/primeflex.css";
// prime theme
import "primereact/resources/themes/saga-green/theme.css";  // 
// prime icons
import "primeicons/primeicons.css";

import { locale, addLocale } from 'primereact/api';
import { primeConfLanguaje } from './conf/languageApp';
locale('es');
addLocale('es', primeConfLanguaje );

// React Router
import { BrowserRouter } from 'react-router-dom';
import { Router } from './Router';
// React query
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools'
// generalContext
import { GeneralProvider } from './shared/GeneralContext';
        

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 15* 60 * 1000, // 15 min   para hacer fetch de las peticiones hechas con useQuery 
      cacheTime: 3* 60 * 1000,   // 3 min   para eliminar datos en cache inactivos  
      retry: 2,
      retryDelay: 10*1000
    }
  }
});
        

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GeneralProvider>

          <Router />
          
        </GeneralProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
