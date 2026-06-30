import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GitHubProvider } from "./context/GitHubContext";
import { LanguageProvider } from "./context/LanguageContext";
import Navbar from "./components/Navbar";
import SyncBanner from "./components/SyncBanner";
import Hero from "./components/Hero";
import TabsContent from "./components/TabsContent";
import Footer from "./components/Footer";
import NotFound from "./pages/NotFound";

function HomePage() {
  return (
    <>
      <Navbar />
      <SyncBanner />
      <Hero />
      <TabsContent />
      <Footer />
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <GitHubProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500/30">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </GitHubProvider>
    </LanguageProvider>
  );
}

export default App;
