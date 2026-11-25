import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { ScrollToTop } from './components/ScrollToTop';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { EnquiryModal } from './components/EnquiryModal';
import { AnnouncementTicker } from './components/AnnouncementTicker';
import { PromoPopupBanner } from './components/PromoPopupBanner';
import { EnquiryProvider } from './context/EnquiryContext';
import { CmsProvider } from './context/CmsContext';

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
    <BrowserRouter>
      <CmsProvider>
        <EnquiryProvider>
          <ScrollToTop />
          <AppShell />
        </EnquiryProvider>
      </CmsProvider>
    </BrowserRouter>
  );
}
