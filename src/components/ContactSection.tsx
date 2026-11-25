import React, { useState } from 'react';
import { Send, CheckCircle2, MessageCircle, MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { STUDIO_CONFIG } from '../data/studioData';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    projectType: 'Residential',
    location: '',
    budget: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const projectTypes = [
    'Residential',
    'Commercial',
    'Vastu Consultation',
    '2D CAD & 3D Visualization',
    'Turnkey Execution',
    'Other',
  ];

  const [whatsAppNotice, setWhatsAppNotice] = useState(false);

  const handleWhatsApp = () => {
    const rawNumber = STUDIO_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
    const defaultMsg = encodeURIComponent(
      `Hello Muskan, I am interested in discussing a ${formData.projectType || 'interior'} project with ${STUDIO_CONFIG.name}.`
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

  return (
    <section id="contact" className="py-24 lg:py-36 bg-[#FAF9F7] border-b border-[#DDD9D0]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#B9322C] font-medium block mb-3">
                Inquire
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#161617] leading-[1.1]">
                Let&apos;s shape a space <br />
                <span className="italic font-normal text-[#76726B]">that feels unmistakably yours.</span>
              </h2>
              <p className="text-sm sm:text-base text-[#76726B] mt-4 leading-relaxed font-light">
                Share your floor plan, spatial goals, and timeline. Every brief is reviewed personally by {STUDIO_CONFIG.founder}.
              </p>
            </div>

            <div className="pt-6 border-t border-[#DDD9D0] space-y-4 text-xs">
              <div className="flex items-start gap-3 text-[#524E48]">
                <MapPin className="w-4 h-4 text-[#B9322C] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#161617] block mb-0.5">Studio Location</span>
                  <span className="text-[#76726B] font-mono">{STUDIO_CONFIG.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-[#524E48]">
                <Phone className="w-4 h-4 text-[#B9322C] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#161617] block mb-0.5">Telephone</span>
                  <span className="text-[#76726B] font-mono">{STUDIO_CONFIG.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-[#524E48]">
                <Mail className="w-4 h-4 text-[#B9322C] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#161617] block mb-0.5">Direct Correspondence</span>
                  <span className="text-[#76726B] font-mono">{STUDIO_CONFIG.email}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-[#161617] hover:text-[#B9322C] transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp Direct Inquiry</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                {whatsAppNotice && (
                  <p className="text-[11px] text-[#B9322C] font-mono leading-relaxed bg-[#F6F5F2] p-2.5 rounded-xs border border-[#DDD9D0]">
                    * WhatsApp line placeholder ({STUDIO_CONFIG.whatsappNumber}). Please submit your brief using the enquiry form alongside.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#F6F5F2] p-8 sm:p-10 lg:p-12 rounded-xs border border-[#DDD9D0]">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#161617] text-[#E6635C] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#161617]">
                  Project brief received.
                </h3>
                <p className="text-sm text-[#76726B] max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-[#161617] font-medium">{formData.name}</strong>. {STUDIO_CONFIG.responseCommitmentText}
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        projectType: 'Residential',
                        location: '',
                        budget: '',
                        message: '',
                      });
                    }}
                    className="text-xs uppercase tracking-widest font-medium text-[#B9322C] hover:underline"
                  >
                    Submit another inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-[11px] uppercase tracking-wider text-[#524E48] font-medium">
                      Your Full Name *
                    </label>
                    <input
                      id="name"
                      required
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FAF9F7] border border-[#DDD9D0] focus:border-[#B9322C] focus:outline-none text-sm text-[#161617] rounded-xs transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="block text-[11px] uppercase tracking-wider text-[#524E48] font-medium">
                      Contact Number *
                    </label>
                    <input
                      id="phone"
                      required
                      type="tel"
                      placeholder="+91 Phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FAF9F7] border border-[#DDD9D0] focus:border-[#B9322C] focus:outline-none text-sm text-[#161617] rounded-xs transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-[11px] uppercase tracking-wider text-[#524E48] font-medium">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      required
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FAF9F7] border border-[#DDD9D0] focus:border-[#B9322C] focus:outline-none text-sm text-[#161617] rounded-xs transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="location" className="block text-[11px] uppercase tracking-wider text-[#524E48] font-medium">
                      Project Location / City *
                    </label>
                    <input
                      id="location"
                      required
                      type="text"
                      placeholder="Your city or neighborhood"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FAF9F7] border border-[#DDD9D0] focus:border-[#B9322C] focus:outline-none text-sm text-[#161617] rounded-xs transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="projectType" className="block text-[11px] uppercase tracking-wider text-[#524E48] font-medium">
                    Project Typology
                  </label>
                  <select
                    id="projectType"
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FAF9F7] border border-[#DDD9D0] focus:border-[#B9322C] focus:outline-none text-sm text-[#161617] rounded-xs transition-colors cursor-pointer"
                  >
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="budget" className="block text-[11px] uppercase tracking-wider text-[#524E48] font-medium">
                    Approximate Budget (Optional)
                  </label>
                  <input
                    id="budget"
                    type="text"
                    placeholder="Optional estimated range"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FAF9F7] border border-[#DDD9D0] focus:border-[#B9322C] focus:outline-none text-sm text-[#161617] rounded-xs transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="block text-[11px] uppercase tracking-wider text-[#524E48] font-medium">
                    Brief Description of Requirements
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Share your room details, 2D/3D needs, or Vastu goals..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FAF9F7] border border-[#DDD9D0] focus:border-[#B9322C] focus:outline-none text-sm text-[#161617] rounded-xs transition-colors resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#B9322C] text-white hover:bg-[#161617] text-xs uppercase tracking-widest font-medium transition-colors rounded-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Project Inquiry</span>
                  </button>

                  <span className="text-[11px] text-[#76726B]">
                    Direct consultation with {STUDIO_CONFIG.founder}
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
