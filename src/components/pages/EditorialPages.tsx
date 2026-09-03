import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const EditorialPages: React.FC<{ type: 'about' | 'blog' | 'contact' }> = ({ type }) => {
  const { showToast, setActivePage, addContactInquiry } = useStore();

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Order Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const [useGoogleFormEmbed, setUseGoogleFormEmbed] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      showToast('Please fill out all contact fields', 'warning');
      return;
    }

    // Auto-Sync Contact Submission to Google Form & StoreContext Inquiries
    try {
      addContactInquiry({
        name: contactName,
        email: contactEmail,
        subject: contactSubject || 'Client Atelier Inquiry',
        message: contactMessage
      });

      const googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfutf74XvuQ7zETKUR4l_kDyVRFMuiax5llflUGc7jzTduK1w/formResponse';
      const formPayload = new URLSearchParams();
      formPayload.append('entry.1788172552', contactName);
      formPayload.append('entry.202620000', `Email: ${contactEmail} - Subject: ${contactSubject} - Msg: ${contactMessage}`);

      fetch(googleFormUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formPayload
      }).catch((e) => console.log('[Google Form Sync] Attempted:', e));
    } catch (e) {
      console.log('[Google Form Sync] Error:', e);
    }

    setTicketSubmitted(true);
    showToast('Inquiry received & logged to Admin Console!', 'success');
  };

  // ABOUT US
  if (type === 'about') {
    return (
      <div className="bg-[#F9F8F6] min-h-screen py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-[11px] font-bold text-[#C85A32] uppercase tracking-widest">
              Our Heritage & Craft
            </span>
            <h1 className="text-4xl sm:text-5xl font-semibold text-[#1F1F1F] font-editorial leading-tight">
              DivaChic: Bespoke Haute Couture & Visionary Design
            </h1>
            <p className="text-sm text-[#736B5E] leading-relaxed">
              DivaChic was established with a singular ambition: to curate exquisite, runway-inspired silhouettes and timeless wardrobe investments that celebrate confidence, poise, and uncompromising craftsmanship.
            </p>
          </div>

          <div className="relative aspect-[16/9] rounded-xs overflow-hidden shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop"
              alt="DivaChic Atelier & Flagship"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            <div className="bg-white p-6 border border-[#EAE6DE] rounded-xs space-y-3">
              <h3 className="text-base font-semibold text-[#1F1F1F] font-editorial">
                01. Ethical Materials
              </h3>
              <p className="text-xs text-[#6E685F] leading-relaxed">
                We source only certified organic long-staple cotton, non-mulesed Scandinavian merino wool, and eco-certified Japanese bio-acetates.
              </p>
            </div>

            <div className="bg-white p-6 border border-[#EAE6DE] rounded-xs space-y-3">
              <h3 className="text-base font-semibold text-[#1F1F1F] font-editorial">
                02. Lifetime Craft
              </h3>
              <p className="text-xs text-[#6E685F] leading-relaxed">
                Every seam, rivet, and hinge is calibrated to endure hundreds of wear cycles, developing a rich individual patina over years of use.
              </p>
            </div>

            <div className="bg-white p-6 border border-[#EAE6DE] rounded-xs space-y-3">
              <h3 className="text-base font-semibold text-[#1F1F1F] font-editorial">
                03. Fair Production
              </h3>
              <p className="text-xs text-[#6E685F] leading-relaxed">
                We partner exclusively with family-owned ateliers in Portugal, Japan, and Italy with strict living wage certifications.
              </p>
            </div>
          </div>

          <div className="text-center pt-8">
            <button
              onClick={() => setActivePage('shop')}
              className="bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold px-8 py-3.5 rounded-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Explore the Collection
            </button>
          </div>

        </div>
      </div>
    );
  }

  // JOURNAL / BLOG
  if (type === 'blog') {
    const articles = [
      {
        id: '1',
        title: 'Nordic Functionalism: Why Less is More in Contemporary Living',
        date: 'October 14, 2026',
        category: 'Philosophy',
        image: 'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?q=80&w=800&auto=format&fit=crop',
        excerpt: 'Examining the timeless architectural principles behind Scandinavian minimalism and how they translate to everyday utility.'
      },
      {
        id: '2',
        title: 'The Optics Care Guide: Preserving Handmade Bio-Acetate Frames',
        date: 'September 28, 2026',
        category: 'Care Guide',
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
        excerpt: 'How ultrasonic cleaning, proper hinge tensioning, and microfiber storage keep your designer eyewear pristine for decades.'
      },
      {
        id: '3',
        title: 'From Forest to Fabric: The Story Behind Our Organic Merino Knits',
        date: 'August 19, 2026',
        category: 'Sustainability',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
        excerpt: 'Tracking the regenerative farming practices across Swedish pastures that provide our zero-carbon raw textiles.'
      }
    ];

    return (
      <div className="bg-[#F9F8F6] min-h-screen py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-[11px] font-bold text-[#C85A32] uppercase tracking-widest">
              The DivaChic Gazette
            </span>
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#1F1F1F] font-editorial">
              Stories of Craftsmanship, Couture & Design
            </h1>
            <p className="text-xs text-[#8C8477]">
              Essays and couture musings from our studio creative directors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((art) => (
              <div key={art.id} className="bg-white border border-[#EAE6DE] rounded-xs overflow-hidden flex flex-col group shadow-xs">
                <div className="relative aspect-[16/10] overflow-hidden bg-[#F5F3EF]">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-[#8C8477] uppercase tracking-wider mb-2">
                      <span className="text-[#C85A32] font-semibold">{art.category}</span>
                      <span>{art.date}</span>
                    </div>
                    <h3 className="text-base font-semibold text-[#1F1F1F] font-editorial leading-snug group-hover:text-[#C85A32] transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-xs text-[#6E685F] mt-2 line-clamp-3 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  <button
                    onClick={() => showToast('Full journal article rendered', 'info')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F1F1F] group-hover:text-[#C85A32] transition-colors pt-2 cursor-pointer"
                  >
                    <span>Read Full Essay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  // CONTACT & HELP
  return (
    <div className="bg-[#F9F8F6] min-h-screen py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-3">
          <span className="text-[11px] font-bold text-[#C85A32] uppercase tracking-widest">
            Client Concierge & Atelier
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#1F1F1F] font-editorial">
            We Are Here to Assist You
          </h1>
          <p className="text-xs text-[#7A7264] max-w-md mx-auto">
            Have questions regarding sizing, custom prescription lenses, or bulk orders? Connect with our specialist support team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Contact Information & Hours */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 border border-[#EAE6DE] rounded-xs shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F1F1F]">
                DivaChic Flagship Studio
              </h3>

              <div className="space-y-3 text-xs text-[#555048]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C85A32] mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-[#1F1F1F]">DivaChic Studio Headquarters:</strong>
                    <p>#42, 100 Feet Ring Road, Stage 2, BTM Layout, South Bangalore, Karnataka — 560076</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#C85A32] mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-[#1F1F1F]">Direct Concierge Email:</strong>
                    <a href="mailto:divachic@icloud.com" className="hover:text-[#C85A32] underline font-medium">divachic@icloud.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#C85A32] mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-[#1F1F1F]">Customer & Concierge Hotline:</strong>
                    <a href="tel:6282377918" className="hover:text-[#C85A32] font-semibold block">+91 6282377918 (Mon-Sat 10:00 - 19:00 IST)</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#C85A32] mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-[#1F1F1F]">Response SLA:</strong>
                    <p>Under 2 hours during active studio business hours.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick FAQ summary */}
            <div className="bg-[#FAF9F6] p-6 border border-[#EAE6DE] rounded-xs space-y-3 text-xs text-[#6E685F]">
              <h4 className="font-bold uppercase text-[#1F1F1F]">Frequently Asked</h4>
              <p><strong>Q: How fast is standard delivery?</strong><br />Standard courier takes 2-5 business days across India & worldwide.</p>
              <p><strong>Q: What is the return window?</strong><br />Maximum 7 days hassle-free return & exchange policy for unworn items.</p>
            </div>
          </div>

          {/* Contact Form & Google Form Embed */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 border border-[#EAE6DE] rounded-xs shadow-xs space-y-5">
              
              {/* Form Mode Selector */}
              <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
                <span className="text-xs font-bold text-[#1F1F1F]">Select Inquiry Form:</span>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setUseGoogleFormEmbed(false)}
                    className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer ${
                      !useGoogleFormEmbed ? 'bg-[#1F1F1F] text-white font-semibold' : 'bg-[#F5F3EF] text-[#6E685F]'
                    }`}
                  >
                    Direct Studio Form
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseGoogleFormEmbed(true)}
                    className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer ${
                      useGoogleFormEmbed ? 'bg-[#C85A32] text-white font-semibold' : 'bg-[#F5F3EF] text-[#6E685F]'
                    }`}
                  >
                    📋 Google Form
                  </button>
                </div>
              </div>

              {useGoogleFormEmbed ? (
                <div className="space-y-3">
                  <div className="text-xs text-[#7A7264] flex justify-between items-center">
                    <span>Submitting via Official Google Form Link:</span>
                    <a
                      href="https://docs.google.com/forms/d/e/1FAIpQLSfutf74XvuQ7zETKUR4l_kDyVRFMuiax5llflUGc7jzTduK1w/viewform"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#C85A32] underline font-semibold"
                    >
                      Open in New Tab ↗
                    </a>
                  </div>
                  <div className="w-full min-h-[500px] border border-[#EAE6DE] rounded-xs overflow-hidden bg-white">
                    <iframe
                      src="https://docs.google.com/forms/d/e/1FAIpQLSfutf74XvuQ7zETKUR4l_kDyVRFMuiax5llflUGc7jzTduK1w/viewform?embedded=true"
                      width="100%"
                      height="540"
                      frameBorder="0"
                      marginHeight={0}
                      marginWidth={0}
                      title="Google Form Client Inquiry"
                    >
                      Loading Google Form...
                    </iframe>
                  </div>
                </div>
              ) : ticketSubmitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-14 h-14 bg-[#EBF5EF] text-[#1E5638] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1F1F1F] font-editorial">
                    Message Dispatched & Synced to Google Form
                  </h3>
                  <p className="text-xs text-[#7A7264] max-w-sm mx-auto leading-relaxed">
                    Thank you, {contactName}. Your inquiry has been logged and synced to our Google Form dataset. A concierge specialist will reply to <strong>{contactEmail}</strong> shortly.
                  </p>
                  <button
                    onClick={() => setTicketSubmitted(false)}
                    className="bg-[#1F1F1F] text-white text-xs font-semibold px-6 py-2.5 rounded-xs cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <h3 className="text-base font-semibold text-[#1F1F1F] font-editorial mb-2">
                    Send a Message to Our Atelier (Auto-Syncs to Google Form)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#4A453C] mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Ashin Shiju"
                        className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#4A453C] mb-1">Your Email Address *</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="ashin@example.com"
                        className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4A453C] mb-1">Topic / Subject</label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs bg-white focus:outline-none focus:border-[#C85A32]"
                    >
                      <option value="Order Inquiry">Order Inquiry & Tracking</option>
                      <option value="Prescription Sizing">Prescription Optics / Sizing</option>
                      <option value="Returns & Exchanges">Returns & Exchanges</option>
                      <option value="Wholesale">Wholesale & Stockist Requests</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4A453C] mb-1">Your Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Please detail your question or inquiry here..."
                      className="w-full px-3 py-2 text-xs border border-[#D5D0C5] rounded-xs focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#C85A32] hover:bg-[#B34E2A] text-white text-xs font-semibold tracking-wider uppercase px-8 py-3.5 rounded-xs transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to Atelier</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
