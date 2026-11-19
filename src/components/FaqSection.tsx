import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { apiFetch } from '../lib/api';

export interface FaqItem {
  id: string;
  category: 'Coverage' | 'Process' | 'Verification' | 'Pricing & Privacy';
  question: string;
  answer: string;
}

interface FaqSectionProps {
  onNavigate: (path: string) => void;
  onFaqsLoaded?: (faqs: FaqItem[]) => void;
}

const CATEGORIES: Array<'All' | FaqItem['category']> = [
  'All',
  'Coverage',
  'Process',
  'Verification',
  'Pricing & Privacy',
];

export function FaqSection({ onNavigate, onFaqsLoaded }: FaqSectionProps) {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | FaqItem['category']>('All');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    apiFetch<{ faqs: FaqItem[] }>('/api/faqs')
      .then((res) => {
        if (!mounted) return;
        setFaqs(res.faqs);
        onFaqsLoaded?.(res.faqs);
        if (res.faqs.length > 0) {
          setOpenId(res.faqs[0].id);
        }
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Could not load FAQs');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (onFaqsLoaded || faqs.length === 0) return;
    const existing = document.getElementById('fixsoon-faq-jsonld');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = 'fixsoon-faq-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('fixsoon-faq-jsonld');
      if (el) el.remove();
    };
  }, [faqs, onFaqsLoaded]);

  const filtered =
    activeCategory === 'All' ? faqs : faqs.filter((item) => item.category === activeCategory);

  return (
    <section
      aria-labelledby="faq-heading"
      className="border-t border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] py-14"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Heading + Filter Controls */}
          <div className="lg:col-span-4 space-y-5">
            <div className="space-y-2">
              <div className="text-xs font-mono font-semibold text-[#B45309] dark:text-[#F59E0B]">
                Common Questions
              </div>
              <h2
                id="faq-heading"
                className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] [text-wrap:balance]"
              >
                Coverage, dispatch &amp; verification explained
              </h2>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                Clear answers on where FixSoon operates, how quotes work, and how every professional is vetted.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1E293B]">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    activeCategory === cat
                      ? 'bg-[#FFFFFF] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs'
                      : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => onNavigate('/request')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#B45309] dark:hover:text-[#F59E0B]"
              >
                <span>Ready to get started? Post a request</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Collapsible Accordion */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-16 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#475569] dark:text-[#94A3B8]">
                Unable to load FAQs right now. You can still browse{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/how-it-works')}
                  className="font-semibold text-[#B45309] dark:text-[#F59E0B] underline"
                >
                  How FixSoon Works
                </button>
                .
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B] border-y border-[#E2E8F0] dark:border-[#1E293B]">
                {filtered.map((item) => {
                  const isOpen = openId === item.id;
                  return (
                    <div key={item.id}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${item.id}`}
                        onClick={() => setOpenId(isOpen ? null : item.id)}
                        className="w-full py-4 sm:py-5 text-left flex items-start justify-between gap-4 group"
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-[#B45309] dark:text-[#F59E0B]">
                            {item.category}
                          </div>
                          <div className="font-display text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#B45309] dark:group-hover:text-[#F59E0B] transition-colors">
                            {item.question}
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-[#475569] dark:text-[#94A3B8] shrink-0 mt-1 transition-transform duration-150 ${
                            isOpen ? 'rotate-180 text-[#B45309] dark:text-[#F59E0B]' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div
                          id={`faq-panel-${item.id}`}
                          className="pb-5 pr-8 text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed"
                        >
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
