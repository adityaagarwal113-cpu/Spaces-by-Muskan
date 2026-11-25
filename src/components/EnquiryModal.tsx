import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, MessageCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEnquiry } from '../context/EnquiryContext';
import { useCms } from '../context/CmsContext';

export const EnquiryModal: React.FC = () => {
  const { isOpen, initialService, closeEnquiry } = useEnquiry();
  const { siteConfig, services } = useCms();

  const projectTypes = services.length > 0
    ? services.map((s) => s.title)
    : [
        'Residential Interiors',
        'Commercial Interiors',
        'Vastu Consultation & Zoning',
        '2D CAD & Working Drawings',
        '3D Visualization (SketchUp & V-Ray)',
        'Site Supervision & Turnkey Work',
      ];

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    projectType: 'Residential Interiors',
    location: '',
    approxArea: '',
    timeline: 'Next 1–3 Months',
    brief: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrderNum, setSubmittedOrderNum] = useState('');

  useEffect(() => {
    if (initialService) {
      setFormData((prev) => ({ ...prev, projectType: initialService }));
    }
  }, [initialService]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setIsSubmitted(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeEnquiry();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeEnquiry]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        setSubmittedOrderNum(data.enquiry?.orderNumber || '');
      }
      setIsSubmitted(true);
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const message = encodeURIComponent(
      `Hello ${siteConfig.founder.split(' ')[0]}, I would like to inquire about an interior design project with ${siteConfig.name}.\n\n` +
      `Name: ${formData.name || 'Client'}\n` +
      `Service: ${formData.projectType}\n` +
      `Location: ${formData.location || 'Not specified'}\n` +
      `Area: ${formData.approxArea || 'Not specified'}\n` +
      `Brief: ${formData.brief || 'Looking for interior design & Vastu consultation'}`
    );
    const rawNumber = siteConfig.whatsappNumber.replace(/[^0-9]/g, '');
    const waUrl = rawNumber && rawNumber.length >= 7
      ? `https://wa.me/${rawNumber}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEnquiry}
            className="fixed inset-0 bg-[#181615]/75 backdrop-blur-sm transition-opacity"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-[#FBF9F6] text-[#181615] border border-[#DFD8CE] shadow-2xl overflow-hidden z-10 my-auto"
          >
            <div className="h-[3px] bg-gradient-to-r from-[#733928] via-[#8E4A36] to-[#A38452]" />

            <div className="p-6 sm:p-8 pb-5 flex items-start justify-between border-b border-[#DFD8CE]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#8E4A36] font-medium">
                  <span>{siteConfig.name}</span>
                  <span className="text-[#DFD8CE]" aria-hidden="true">·</span>
                  <span className="text-[#6B655E]">Consultation Brief</span>
                </div>
                <h3 className="font-serif text-3xl font-light text-[#181615]">
                  Start a Project
                </h3>
                <p className="text-xs text-[#6B655E] font-light">
                  {siteConfig.responseCommitmentText}
                </p>
              </div>

              <button
                onClick={closeEnquiry}
                className="w-8 h-8 rounded-full border border-[#DFD8CE] flex items-center justify-center text-[#6B655E] hover:text-[#181615] hover:border-[#181615] transition-colors cursor-pointer"
                aria-label="Close Enquiry Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 sm:p-8 max-h-[76vh] overflow-y-auto">
              {isSubmitted ? (
                <div className="py-8 text-center space-y-5">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#8E4A36]/10 border border-[#8E4A36]/30 flex items-center justify-center text-[#8E4A36]">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <div className="space-y-2 max-w-md mx-auto">
                    <h4 className="font-serif text-3xl text-[#181615]">
                      Project Brief Received
                    </h4>
                    <p className="text-xs sm:text-sm text-[#5B554E] font-light leading-relaxed">
                      Thank you, <span className="font-medium text-[#181615]">{formData.name}</span>. Your brief{submittedOrderNum ? ` (${submittedOrderNum})` : ''} has been recorded for {siteConfig.founder} to review within 24–48 hours.
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={handleWhatsAppRedirect}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#181615] hover:bg-[#8E4A36] text-[#FBF9F6] text-xs uppercase tracking-widest font-medium transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      <span>Continue on WhatsApp</span>
                    </button>
                    <button
                      onClick={closeEnquiry}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#DFD8CE] text-[#181615] hover:bg-black/5 text-xs uppercase tracking-widest font-medium transition-colors cursor-pointer"
                    >
                      <span>Close</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.18em] text-[#6B655E] mb-2.5 font-medium">
                      Scope of Interest *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {projectTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, projectType: type }))}
                          className={`px-3.5 py-2.5 text-xs font-sans text-left border transition-all cursor-pointer ${
                            formData.projectType === type
                              ? 'bg-[#181615] text-white border-[#181615] font-medium'
                              : 'bg-white text-[#5B554E] border-[#DFD8CE] hover:border-[#8E4A36]'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.16em] text-[#6B655E] mb-1.5 font-medium">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="w-full px-3.5 py-2.5 bg-white border border-[#DFD8CE] text-sm text-[#181615] placeholder:text-[#6B655E]/55 focus:outline-none focus:border-[#8E4A36] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.16em] text-[#6B655E] mb-1.5 font-medium">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 Phone number"
                        className="w-full px-3.5 py-2.5 bg-white border border-[#DFD8CE] text-sm text-[#181615] placeholder:text-[#6B655E]/55 focus:outline-none focus:border-[#8E4A36] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.16em] text-[#6B655E] mb-1.5 font-medium">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@domain.com"
                        className="w-full px-3.5 py-2.5 bg-white border border-[#DFD8CE] text-sm text-[#181615] placeholder:text-[#6B655E]/55 focus:outline-none focus:border-[#8E4A36] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.16em] text-[#6B655E] mb-1.5 font-medium">
                        Project City / Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="City or neighborhood"
                        className="w-full px-3.5 py-2.5 bg-white border border-[#DFD8CE] text-sm text-[#181615] placeholder:text-[#6B655E]/55 focus:outline-none focus:border-[#8E4A36] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.16em] text-[#6B655E] mb-1.5 font-medium">
                        Approx. Area (sq. ft.)
                      </label>
                      <input
                        type="text"
                        name="approxArea"
                        value={formData.approxArea}
                        onChange={handleChange}
                        placeholder="e.g. 1,800 sq.ft."
                        className="w-full px-3.5 py-2.5 bg-white border border-[#DFD8CE] text-sm text-[#181615] placeholder:text-[#6B655E]/55 focus:outline-none focus:border-[#8E4A36] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.16em] text-[#6B655E] mb-1.5 font-medium">
                        Desired Timeline
                      </label>
                      <select
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#DFD8CE] text-sm text-[#181615] focus:outline-none focus:border-[#8E4A36] transition-colors"
                      >
                        <option value="Immediate / Next 30 Days">Immediate / Next 30 Days</option>
                        <option value="Next 1–3 Months">Next 1–3 Months</option>
                        <option value="Next 3–6 Months">Next 3–6 Months</option>
                        <option value="Exploratory / Planning Stage">Exploratory / Planning Stage</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.16em] text-[#6B655E] mb-1.5 font-medium">
                      Tell us about your space &amp; Vastu preferences
                    </label>
                    <textarea
                      name="brief"
                      rows={3}
                      value={formData.brief}
                      onChange={handleChange}
                      placeholder="Share your requirements, aesthetic vision, or commercial goals..."
                      className="w-full px-3.5 py-2.5 bg-white border border-[#DFD8CE] text-sm text-[#181615] placeholder:text-[#6B655E]/55 focus:outline-none focus:border-[#8E4A36] transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#DFD8CE]">
                    <span className="text-[11px] text-[#6B655E]">
                      Reviewed personally by {siteConfig.founder}
                    </span>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleWhatsAppRedirect}
                        title="Chat directly on WhatsApp"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-3 border border-[#DFD8CE] hover:border-[#181615] text-xs uppercase tracking-wider text-[#181615] transition-colors cursor-pointer shrink-0"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-700" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#8E4A36] hover:bg-[#181615] text-white text-xs uppercase tracking-widest font-medium transition-colors disabled:opacity-60 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <span>Submitting...</span>
                        ) : (
                          <>
                            <span>Send Enquiry</span>
                            <Send className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
