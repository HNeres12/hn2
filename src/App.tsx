import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InvestmentProvider } from "./contexts/InvestmentContext";
import { ExpenseProvider } from "./contexts/ExpenseContext";
import InvestmentDashboard from "./pages/InvestmentDashboard";
import InvestmentManagement from "./pages/InvestmentManagement";
import FinanceDashboard from "./pages/FinanceDashboard";
import ExpenseManagement from "./pages/ExpenseManagement";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <InvestmentProvider>
        <ExpenseProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<InvestmentDashboard />} />
              <Route path="/investments" element={<InvestmentManagement />} />
              <Route path="/finances" element={<FinanceDashboard />} />
              <Route path="/expenses" element={<ExpenseManagement />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ExpenseProvider>
      </InvestmentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
