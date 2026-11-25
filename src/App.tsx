import React from 'react';
import { BrowserRouter, Link, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Eye, X } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { ScrollToTop } from './components/ScrollToTop';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { EnquiryModal } from './components/EnquiryModal';
import { AnnouncementTicker } from './components/AnnouncementTicker';
import { PromoPopupBanner } from './components/PromoPopupBanner';
import { EnquiryProvider } from './context/EnquiryContext';
import { CmsProvider, useCms } from './context/CmsContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Multi-Page Routes
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { AboutPage } from './pages/AboutPage';
import { ProcessPage } from './pages/ProcessPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';

const AppShell: React.FC = () => {
  const location = useLocation();
  const { isPreviewMode, exitPreviewMode } = useCms();
  const isAdminRoute =
    location.pathname.startsWith('/wp-admin') || location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Routes location={location} key={location.pathname}>
        <Route path="/wp-admin/*" element={<AdminPage />} />
        <Route path="/wp-admin" element={<AdminPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    );
  }

  return (
    <>
      <ScrollProgressBar />
      <EnquiryModal />
      <PromoPopupBanner />

      {isPreviewMode && (
        <div className="bg-[#1D2327] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-[#2271B1] sticky top-0 z-[60]">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-[#72AEE6] shrink-0" />
            <span>
              <strong>Draft Preview Mode</strong> — Showing current CMS edits before publishing live.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/wp-admin"
              className="px-2.5 py-1 bg-[#2271B1] hover:bg-[#135E96] text-white font-medium transition-colors"
            >
              Open Admin
            </Link>
            <button
              type="button"
              onClick={exitPreviewMode}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#2C3338] hover:bg-[#3C434A] text-[#F0F0F1] cursor-pointer transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Exit Preview</span>
            </button>
          </div>
        </div>
      )}

      <div
        id="storefront-shell"
        className="min-h-[100dvh] flex flex-col bg-[var(--color-stone-canvas)] text-[#181615] relative selection:bg-[#8E4A36] selection:text-[#FBF9F6]"
      >
        <AnnouncementTicker position="top_bar" />
        <Header />

        <main className="flex-1 min-h-[100dvh]">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/work" element={<ProjectsPage />} />
              <Route path="/work/:id" element={<ProjectDetailPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/process" element={<ProcessPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </AnimatePresence>
        </main>

        <WhatsAppButton />
        <Footer />
      </div>
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <CmsProvider>
          <EnquiryProvider>
            <ScrollToTop />
            <AppShell />
          </EnquiryProvider>
        </CmsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
