
import React, { useState } from 'react';
import { ShieldCheck, Search, Zap, Globe, Scale, ArrowRight, MessageCircle, BarChart3, Check, Star, Calendar } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: "Starter",
      price: "0",
      description: "Perfect for individual creators and startups.",
      features: ["1 Trademark Search / mo", "Basic Logo Analysis", "Standard AI Chat", "Community Support"],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Professional",
      price: billingCycle === 'monthly' ? "49" : "39",
      description: "For growing brands and scaling businesses.",
      features: ["Unlimited Trademark Searches", "Advanced Design Comparison", "DMCA Takedown Generator", "Priority AI Consultant", "Exportable Legal Reports"],
      cta: "Go Pro Now",
      popular: true
    },
    {
      name: "Enterprise",
      price: "199",
      description: "Dedicated protection for large portfolios.",
      features: ["Multi-user Access", "Bulk Filing Automation", "API Access", "Dedicated IP Attorney (AI)", "White-label Reports"],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBookExpert = () => {
    // In a real app, this would link to Calendly or a booking modal
    window.open('https://calendly.com', '_blank');
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 md:py-6 sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">MarkGuard AI</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
          <a href="#" className="hover:text-blue-600 transition-colors">Features</a>
          <button onClick={scrollToPricing} className="hover:text-blue-600 transition-colors">Pricing</button>
          <button onClick={handleBookExpert} className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
            <Calendar className="w-4 h-4" />
            <span>Book Expert</span>
          </button>
        </div>
        <button 
          onClick={onEnter}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-black transition-all flex items-center space-x-2"
        >
          <span>Launch App</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full mb-8">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-wider">Now Live: 2.5 Pro Vision Models</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 leading-[1.1]">
          Global Intellectual Property <br />
          <span className="gradient-text">Secured by Intelligence</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-3xl mx-auto leading-relaxed">
          The all-in-one AI platform for international trademark search, logo analysis, and legal enforcement. 
          Protect your brand across 100+ jurisdictions in seconds.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button 
            onClick={onEnter}
            className="w-full md:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all transform hover:-translate-y-1"
          >
            Get Started Free
          </button>
          <button 
            onClick={handleBookExpert}
            className="w-full md:w-auto bg-white text-slate-900 border-2 border-slate-900 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center space-x-2"
          >
            <Calendar className="w-5 h-5" />
            <span>Book Legal Call</span>
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-slate-50 py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Enterprise-Grade AI Toolkit</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Everything you need to manage an international IP portfolio from a single dashboard.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            { icon: Search, title: "Global Search", desc: "Deep-search trademarks across 100+ countries with real-time conflict analysis.", color: "blue" },
            { icon: Zap, title: "Design Comparison", desc: "Analyze visual similarity to existing registered marks with high-fidelity vision AI.", color: "indigo" },
            { icon: Scale, title: "DMCA Enforcement", desc: "Generate legally compliant takedown notices and analyze infringements instantly.", color: "red" },
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className={`bg-${feature.color}-50 text-${feature.color}-600 p-4 rounded-2xl w-fit mb-6`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 md:px-12 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-500 mb-10">Choose the protection level your brand deserves.</p>
          
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-blue-600' : 'text-slate-400'}`}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="w-14 h-7 bg-slate-200 rounded-full relative p-1 transition-colors hover:bg-slate-300"
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${billingCycle === 'yearly' ? 'translate-x-7' : ''}`}></div>
            </button>
            <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-blue-600' : 'text-slate-400'}`}>
              Yearly <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-1">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`relative flex flex-col p-8 rounded-[2.5rem] border transition-all ${
                plan.popular 
                  ? 'border-blue-600 shadow-2xl shadow-blue-100 scale-105 z-10' 
                  : 'border-slate-200 bg-slate-50/50 hover:bg-white'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Most Popular</span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline space-x-1 mb-4">
                <span className="text-4xl font-black text-slate-900">${plan.price}</span>
                <span className="text-slate-500 font-medium">/mo</span>
              </div>
              <p className="text-sm text-slate-500 mb-8">{plan.description}</p>
              
              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-sm text-slate-600">
                    <Check className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-blue-600' : 'text-green-500'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={onEnter}
                className={`w-full py-4 rounded-2xl font-bold transition-all ${
                  plan.popular 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700' 
                    : 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Footer Section */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-blue-600 p-2 rounded-lg">
                <ShieldCheck className="text-white w-6 h-6" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">MarkGuard AI</span>
            </div>
            <p className="max-w-sm mb-6">
              Automated legal intelligence for global brand owners. Secure your future today.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Tools</h4>
            <ul className="space-y-4 text-sm">
              <li><button onClick={onEnter} className="hover:text-white transition-colors">Trademark Search</button></li>
              <li><button onClick={onEnter} className="hover:text-white transition-colors">Logo Vision</button></li>
              <li><button onClick={onEnter} className="hover:text-white transition-colors">DMCA Center</button></li>
              <li><button onClick={handleBookExpert} className="hover:text-white transition-colors">Book Expert</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 text-xs text-center">
          <p>© {currentYear} MarkGuard AI Inc. All rights reserved. | Copyright by Legalite</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
