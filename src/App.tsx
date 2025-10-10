import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Feed from "./pages/FeedLive";
import Dashboard from "./pages/DashboardWithBackground"; // Dashboard with background
import CreateBot from "./pages/CreateBot";
import GeminiTest from "./pages/GeminiTest";
import BotsCheck from "./pages/BotsCheck";
import NotFound from "./pages/NotFound";
import ComingSoon from "./pages/ComingSoon";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Coming Soon Page */}
          <Route path="/" element={<ComingSoon />} />
          
          {/* Protected Routes - Require Password */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={<ProtectedRoute><Login /></ProtectedRoute>} />
          <Route path="/signup" element={<ProtectedRoute><Signup /></ProtectedRoute>} />
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-bot" element={<ProtectedRoute><CreateBot /></ProtectedRoute>} />
          <Route path="/gemini-test" element={<ProtectedRoute><GeminiTest /></ProtectedRoute>} />
          <Route path="/check-bots" element={<ProtectedRoute><BotsCheck /></ProtectedRoute>} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
