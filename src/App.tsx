import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InvestmentDashboard from "./pages/InvestmentDashboard";
import InvestmentManagement from "./pages/InvestmentManagement";
import AssetTypes from "./pages/AssetTypes";
import FinanceDashboard from "./pages/FinanceDashboard";
import ExpenseManagement from "./pages/ExpenseManagement";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import InstallmentsPage from "./pages/InstallmentsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<InvestmentDashboard />} />
          <Route path="/investments" element={<InvestmentManagement />} />
          <Route path="/asset-types" element={<AssetTypes />} />
          <Route path="/finances" element={<FinanceDashboard />} />
          <Route path="/expenses" element={<ExpenseManagement />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/installments" element={<InstallmentsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
