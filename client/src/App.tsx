import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/context/app-context";
import { CompactViewProvider } from './lib/context/compact-view-context';
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Books from "@/pages/books";
import Borrowers from "@/pages/borrowers";
import Librarians from "@/pages/librarians";
import Borrowing from "@/pages/borrowing";
import Membership from "@/pages/membership";
import Settings from "@/pages/settings";
import Layout from "@/components/layout/sidebar";
import Login from "@/pages/login";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { initializeSampleData } from "./lib/sampleData";
import FeedbackPage from './pages/feedback';

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('isAuthenticated'));
  const [, setLocation] = useLocation();

  useEffect(() => {
    const authState = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(!!authState);
  }, []);

  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
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
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        )}
      </Route>
      <Route path="/books">
        {() => (
          <PrivateRoute>
            <Layout>
              <Books />
            </Layout>
          </PrivateRoute>
        )}
      </Route>
      <Route path="/borrowers">
        {() => (
          <PrivateRoute>
            <Layout>
              <Borrowers />
            </Layout>
          </PrivateRoute>
        )}
      </Route>
      <Route path="/librarians">
        {() => (
          <PrivateRoute>
            <Layout>
              <Librarians />
            </Layout>
          </PrivateRoute>
        )}
      </Route>
      <Route path="/borrowing">
        {() => (
          <PrivateRoute>
            <Layout>
              <Borrowing />
            </Layout>
          </PrivateRoute>
        )}
      </Route>
      <Route path="/membership">
        {() => (
          <PrivateRoute>
            <Layout>
              <Membership />
            </Layout>
          </PrivateRoute>
        )}
      </Route>
      <Route path="/settings">
        {() => (
          <PrivateRoute>
            <Layout>
              <Settings />
            </Layout>
          </PrivateRoute>
        )}
      </Route>
      <Route path="/feedback">
        {() => (
          <PrivateRoute>
            <Layout>
              <FeedbackPage />
            </Layout>
          </PrivateRoute>
        )}
      </Route>
      <Route path="/">
        {() => (
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize sample data on first load
    initializeSampleData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
      <CompactViewProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
        </CompactViewProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;