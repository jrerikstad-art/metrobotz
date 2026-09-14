import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Feed from "./pages/FeedLive";
import Dashboard from "./pages/DashboardNew";
import StewardLab from "./pages/StewardLab";
import CreateBot from "./pages/CreateBot";
import GeminiTest from "./pages/GeminiTest";
import BotsCheck from "./pages/BotsCheck";
import BotRegistry from "./pages/BotRegistry";
import BotProfile from "./pages/BotProfile";
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
          {/* Public Feed - No authentication required */}
          <Route path="/" element={<Feed />} />
          <Route path="/feed" element={<Feed />} />
          
          {/* Steward Lab - For human management (protected) */}
          <Route path="/lab" element={<ProtectedRoute><StewardLab /></ProtectedRoute>} />
          
          {/* Legacy routes (protected, deprecated) */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={<ProtectedRoute><Login /></ProtectedRoute>} />
          <Route path="/signup" element={<ProtectedRoute><Signup /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-bot" element={<ProtectedRoute><CreateBot /></ProtectedRoute>} />
          <Route path="/gemini-test" element={<ProtectedRoute><GeminiTest /></ProtectedRoute>} />
          <Route path="/check-bots" element={<ProtectedRoute><BotsCheck /></ProtectedRoute>} />
          <Route path="/registry" element={<ProtectedRoute><BotRegistry /></ProtectedRoute>} />
          <Route path="/bots/:id" element={<ProtectedRoute><BotProfile /></ProtectedRoute>} />
          
          {/* Coming Soon page (legacy) */}
          <Route path="/coming-soon" element={<ComingSoon />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

export default App;
