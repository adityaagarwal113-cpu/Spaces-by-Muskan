import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, CheckCircle2, MessageCircle, MapPin, Phone, Mail, Instagram, Youtube, Copy, Check } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { PageTransition } from '../components/PageTransition';
import { SEO } from '../components/SEO';
import { submitEnquiryToFirestore } from '../utils/firebaseCmsService';
import { addBrowserEnquiry } from '../utils/localCmsFallback';

export const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { projects, siteConfig, services } = useCms();
  const [copiedRef, setCopiedRef] = useState(false);

  const initialProjectParam = searchParams.get('project');
  const initialServiceParam = searchParams.get('service');
  const matchedProject = initialProjectParam
    ? projects.find((p) => p.id === initialProjectParam)
    : null;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    projectType: matchedProject
      ? `${matchedProject.category} (${matchedProject.title})`
      : initialServiceParam
      ? initialServiceParam
      : 'Residential Interiors',
    location: '',
    budget: '',
    message: matchedProject
      ? `Inquiring about spatial design and detailing similar to ${matchedProject.title}.`
      : initialServiceParam
      ? `Inquiring about studio capabilities for ${initialServiceParam}.`
      : '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submittedBriefId, setSubmittedBriefId] = useState('');
  const [whatsAppNotice, setWhatsAppNotice] = useState(false);

  useEffect(() => {
    if (matchedProject) {
      setFormData((prev) => ({
        ...prev,
        projectType: `${matchedProject.category} (${matchedProject.title})`,
        message: prev.message || `Inquiring about spatial design similar to ${matchedProject.title}.`,
      }));
    } else if (initialServiceParam) {
      setFormData((prev) => ({
        ...prev,
        projectType: initialServiceParam,
        message: prev.message || `Inquiring about studio capabilities for ${initialServiceParam}.`,
      }));
    }
  }, [matchedProject, initialServiceParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      projectType: formData.projectType,
      location: formData.location,
      budget: formData.budget,
      brief: formData.message,
    };
    try {
      const saved = await submitEnquiryToFirestore(payload);
      setSubmittedBriefId(saved.orderNumber);
    } catch {
      const fallback = addBrowserEnquiry(payload);
      setSubmittedBriefId(fallback.orderNumber);
    }
    setSubmitted(true);
  };

  const projectTypes = [
    ...(services.length > 0
      ? services.map((s) => s.title)
      : [
          'Residential Interiors',
          'Commercial Interiors',
          'Vastu Consultation & Zoning',
          '2D CAD & Working Drawings',
          '3D Visualization (SketchUp & V-Ray)',
          'Site Supervision & Turnkey Work',
        ]),
    'Other / Advisory',
  ];

  const handleWhatsApp = () => {
    const rawNumber = siteConfig.whatsappNumber.replace(/[^0-9]/g, '');
    const defaultMsg = encodeURIComponent(
      `Hello ${siteConfig.founder.split(' ')[0]}, I am interested in discussing an interior project for ${
        formData.projectType || 'my space'
      } with ${siteConfig.name}.`
    );
    if (rawNumber && rawNumber.length >= 7) {
      const a = document.createElement('a');
      a.href = `https://wa.me/${rawNumber}?text=${defaultMsg}`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      setWhatsAppNotice(true);
    }
  };

  const handleCopyRef = () => {
    if (!submittedBriefId) return;
    navigator.clipboard.writeText(submittedBriefId);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <PageTransition>
      <SEO
        title="Contact & Project Enquiry"
        description={`Start a residential or commercial interior design, Vastu consultation, or 2D/3D visualization brief with ${siteConfig.name} (${siteConfig.founder}).`}
      />
      <div className="pt-32 pb-24 lg:pt-40 lg:pb-36 bg-[#F6F3EE] text-[#181615] min-h-screen">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl mb-16 lg:mb-20">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-[1px] bg-[#8E4A36]" />
              <span className="text-[11px] uppercase tracking-[0.26em] text-[#8E4A36] font-medium">
                Start a Project
              </span>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-[#181615] leading-[1.06]">
              Let&apos;s design your space <br />
              <span className="italic font-normal text-[#6B655E]">together.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#5B554E] mt-6 leading-relaxed font-light">
              We welcome enquiries for residential homes, signature bedrooms, modular kitchens, Vastu consultations, commercial offices, and turnkey projects.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#181615]">
                  Studio Channels
                </h2>
                <p className="text-xs sm:text-sm text-[#5B554E] mt-2 leading-relaxed font-light">
                  Every enquiry is personally reviewed by {siteConfig.founder} to determine scope suitability, Vastu needs, and design timelines.
                </p>
              </div>

              <div className="space-y-6 pt-4 border-t border-[#DFD8CE] text-xs">
                <div className="flex items-start gap-4 text-[#4A4540]">
                  <MapPin className="w-5 h-5 text-[#8E4A36] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-[#181615] text-sm block mb-1">Studio Address</span>
                    <span className="text-[#6B655E] font-mono">{siteConfig.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 text-[#4A4540]">
                  <Phone className="w-5 h-5 text-[#8E4A36] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-[#181615] text-sm block mb-1">Telephone</span>
                    <span className="text-[#6B655E] font-mono">{siteConfig.phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 text-[#4A4540]">
                  <Mail className="w-5 h-5 text-[#8E4A36] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-[#181615] text-sm block mb-1">
                      Email Correspondence
                    </span>
                    <span className="text-[#6B655E] font-mono">{siteConfig.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 text-[#4A4540]">
                  <Instagram className="w-5 h-5 text-[#8E4A36] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-[#181615] text-sm block mb-1">Instagram</span>
                    <a
                      href={siteConfig.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#8E4A36] hover:underline block"
                    >
                      {siteConfig.instagramHandle}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 text-[#4A4540]">
                  <Youtube className="w-5 h-5 text-[#8E4A36] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-[#181615] text-sm block mb-1">YouTube</span>
                    <a
                      href={siteConfig.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#8E4A36] hover:underline block"
                    >
                      {siteConfig.youtubeHandle}
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#FBF9F6] border border-[#DFD8CE] space-y-3">
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#8E4A36] font-medium block">
                  Quick Consultation
                </span>
                <p className="text-xs text-[#4A4540] leading-relaxed font-light">
                  Prefer a direct chat? Connect with {siteConfig.name} via WhatsApp or submit your brief alongside.
                </p>
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#181615] hover:bg-[#8E4A36] text-white text-[11px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Open WhatsApp Inquiry</span>
                </button>

                {whatsAppNotice && (
                  <p className="text-[11px] text-[#8E4A36] font-mono leading-relaxed bg-[#F6F3EE] p-3 border border-[#DFD8CE]">
                    * WhatsApp line is currently placeholder ({siteConfig.whatsappNumber}). Please transmit your project brief using the enquiry form.
                  </p>
                )}
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#FBF9F6] p-8 sm:p-12 border border-[#DFD8CE]">
              {submitted ? (
                <div className="py-8 sm:py-12 space-y-6">
                  <div className="text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-[#181615] text-[#D5A38C] flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.25em] text-[#8E4A36] font-medium block">
                      Brief Recorded
                    </span>
                    <h3 className="font-serif text-3xl sm:text-4xl font-light text-[#181615]">
                      Project brief received.
                    </h3>
                    <p className="text-sm text-[#6B655E] max-w-md mx-auto leading-relaxed font-light">
                      Thank you, <strong className="text-[#181615] font-medium">{formData.name}</strong>. Your enquiry has been logged for {siteConfig.founder}.
                    </p>
                  </div>

                  <div className="bg-[#F6F3EE] border border-[#DFD8CE] p-6 space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-[#DFD8CE] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-[#6B655E]">
                          Reference:
                        </span>
                        <span className="font-mono text-[#181615] font-semibold text-xs tracking-wider">
                          {submittedBriefId}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyRef}
                        className="inline-flex items-center gap-1.5 text-[11px] text-[#6B655E] hover:text-[#181615] cursor-pointer transition-colors"
                      >
                        {copiedRef ? <Check className="w-3.5 h-3.5 text-[#181615]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedRef ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#262320]">
                      <div>
                        <span className="text-[10px] uppercase text-[#6B655E] block">Client Name</span>
                        <span className="font-medium text-[#181615] text-sm">{formData.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#6B655E] block">Service</span>
                        <span className="font-medium text-[#181615] text-sm">{formData.projectType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#6B655E] block">Location</span>
                        <span className="font-medium text-[#181615] text-sm">
                          {formData.location || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#6B655E] block">Contact</span>
                        <span className="font-mono text-[#181615] text-sm">{formData.phone}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#DFD8CE] flex items-center justify-between text-[11px] text-[#6B655E]">
                      <span>{siteConfig.responseCommitmentText}</span>
                      <span className="font-mono text-[10px]">RECORDED</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={handleWhatsApp}
                      className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 py-3 bg-[#181615] hover:bg-[#8E4A36] text-white text-[11px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Forward Brief to WhatsApp</span>
                    </button>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          name: '',
                          phone: '',
                          email: '',
                          projectType: 'Residential Interiors',
                          location: '',
                          budget: '',
                          message: '',
                        });
                      }}
                      className="w-full sm:w-auto px-6 py-3 border border-[#DFD8CE] hover:border-[#181615] text-[11px] uppercase tracking-[0.18em] font-medium text-[#181615] transition-colors cursor-pointer"
                    >
                      Submit Another Brief
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="border-b border-[#DFD8CE] pb-3 mb-6">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-[#8E4A36] font-medium block">
                      Project Enquiry Form
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label htmlFor="contact-name" className="block text-[11px] uppercase tracking-wider text-[#4A4540] font-medium">
                        Your Full Name *
                      </label>
                      <input
                        id="contact-name"
                        required
                        type="text"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F6F3EE] border border-[#DFD8CE] focus:border-[#8E4A36] focus:outline-none text-sm text-[#181615] transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="contact-phone" className="block text-[11px] uppercase tracking-wider text-[#4A4540] font-medium">
                        Phone / WhatsApp *
                      </label>
                      <input
                        id="contact-phone"
                        required
                        type="tel"
                        placeholder="+91 Phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F6F3EE] border border-[#DFD8CE] focus:border-[#8E4A36] focus:outline-none text-sm text-[#181615] transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label htmlFor="contact-email" className="block text-[11px] uppercase tracking-wider text-[#4A4540] font-medium">
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        required
                        type="email"
                        placeholder="your.email@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F6F3EE] border border-[#DFD8CE] focus:border-[#8E4A36] focus:outline-none text-sm text-[#181615] transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="contact-location" className="block text-[11px] uppercase tracking-wider text-[#4A4540] font-medium">
                        Project Location / City *
                      </label>
                      <input
                        id="contact-location"
                        required
                        type="text"
                        placeholder="Your city or neighborhood"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F6F3EE] border border-[#DFD8CE] focus:border-[#8E4A36] focus:outline-none text-sm text-[#181615] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-type" className="block text-[11px] uppercase tracking-wider text-[#4A4540] font-medium">
                      Project Typology
                    </label>
                    <select
                      id="contact-type"
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F6F3EE] border border-[#DFD8CE] focus:border-[#8E4A36] focus:outline-none text-sm text-[#181615] transition-colors cursor-pointer"
                    >
                      {projectTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-budget" className="block text-[11px] uppercase tracking-wider text-[#4A4540] font-medium">
                      Approximate Budget Scope (Optional)
                    </label>
                    <input
                      id="contact-budget"
                      type="text"
                      placeholder="Optional budget range"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F6F3EE] border border-[#DFD8CE] focus:border-[#8E4A36] focus:outline-none text-sm text-[#181615] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-message" className="block text-[11px] uppercase tracking-wider text-[#4A4540] font-medium">
                      Brief Description of Requirements
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      placeholder="Describe your rooms, target timeline, 2D/3D needs, or Vastu goals..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F6F3EE] border border-[#DFD8CE] focus:border-[#8E4A36] focus:outline-none text-sm text-[#181615] transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#8E4A36] text-white hover:bg-[#181615] text-[11px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Project Brief</span>
                    </button>
                    <span className="text-[11px] text-[#6B655E]">
                      {siteConfig.founder} · {siteConfig.name}
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
