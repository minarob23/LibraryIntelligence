
import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/context/app-context";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Books from "@/pages/books";
import Research from "@/pages/research";
import Borrowers from "@/pages/borrowers";
import Librarians from "@/pages/librarians";
import Borrowing from "@/pages/borrowing";
import Membership from "@/pages/membership";
import Settings from "@/pages/settings";
import Layout from "@/components/layout/sidebar";
import Login from "@/pages/login";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('isAuthenticated'));

  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const [, setLocation] = useLocation();
    
    useEffect(() => {
      if (!isAuthenticated) {
        setLocation('/login');
      }
    }, [isAuthenticated]);

    return isAuthenticated ? <>{children}</> : null;
  };

  return (
    <Switch>
      <Route path="/login">
        {() => <Login onLogin={() => {
          localStorage.setItem('isAuthenticated', 'true');
          setIsAuthenticated(true);
        }} />}
      </Route>
      <Route path="/dashboard">
        {() => (
          <PrivateRoute>
        {() => (
          <Layout>
            <Dashboard />
          </Layout>
        )}
      </Route>
      <Route path="/books">
        {() => (
          <PrivateRoute>
            <Layout>
            <Books />
          </Layout>
        )}
      </Route>
      <Route path="/research">
        {() => (
          <Layout>
            <Research />
          </Layout>
        )}
      </Route>
      <Route path="/borrowers">
        {() => (
          <Layout>
            <Borrowers />
          </Layout>
        )}
      </Route>
      <Route path="/librarians">
        {() => (
          <Layout>
            <Librarians />
          </Layout>
        )}
      </Route>
      <Route path="/borrowing">
        {() => (
          <Layout>
            <Borrowing />
          </Layout>
        )}
      </Route>
      <Route path="/membership">
        {() => (
          <Layout>
            <Membership />
          </Layout>
        )}
      </Route>
      <Route path="/settings">
        {() => (
          <Layout>
            <Settings />
          </Layout>
        )}
      </Route>
      <Route path="/">
        {() => <Redirect to="/login" />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
