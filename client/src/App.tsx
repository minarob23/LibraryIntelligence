import { Switch, Route } from "wouter";
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
import LoginPage from "@/pages/login"; // Import the LoginPage component


function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} /> {/* Added login route */}
      <Route path="/" component={() => <Layout><Dashboard /></Layout>} />
      <Route path="/books" component={Books} />
      <Route path="/research" component={Research} />
      <Route path="/borrowers" component={Borrowers} />
      <Route path="/librarians" component={Librarians} />
      <Route path="/borrowing" component={Borrowing} />
      <Route path="/membership" component={Membership} />
      <Route path="/settings" component={Settings} />
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