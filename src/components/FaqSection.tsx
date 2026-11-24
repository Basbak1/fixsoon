import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { apiFetch } from '../lib/api';

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface FaqSectionProps {
  onNavigate: (path: string) => void;
  onFaqsLoaded?: (faqs: FaqItem[]) => void;
}

export function FaqSection({ onNavigate, onFaqsLoaded }: FaqSectionProps) {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
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
    const existing = document.getElementById('worldleo-faq-jsonld');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = 'worldleo-faq-jsonld';
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
      const el = document.getElementById('worldleo-faq-jsonld');
      if (el) el.remove();
    };
  }, [faqs, onFaqsLoaded]);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(faqs.map((item) => item.category)))],
    [faqs]
  );

  const filtered =
    activeCategory === 'All' ? faqs : faqs.filter((item) => item.category === activeCategory);

  return (
    <section
      aria-labelledby="faq-heading"
      className="border-t border-[#D8D4CA] dark:border-[#343941] bg-[#F4F2EC] dark:bg-[#0D0F12] py-14"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-4 space-y-5">
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#A87919] dark:text-[#D8B45A]">
                Common Questions
              </div>
              <h2
                id="faq-heading"
                className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#171717] dark:text-[#F1EFE8] [text-wrap:balance]"
              >
                WorldLeo Home, Auto &amp; FixSoon explained
              </h2>
              <p className="text-sm text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
                Clear answers on Ontario coverage, written quotes, AI Design Studio preview, and verification standards.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-[#FFFFFF] dark:bg-[#171A1F] border border-[#D8D4CA] dark:border-[#343941]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#171717] text-[#D8B45A] dark:bg-[#D8B45A] dark:text-[#0D0F12]'
                      : 'text-[#55534E] dark:text-[#B5B7BB] hover:text-[#171717] dark:hover:text-[#F1EFE8]'
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
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171717] dark:text-[#F1EFE8] hover:text-[#A87919] dark:hover:text-[#D8B45A] cursor-pointer"
              >
                <span>Ready to get started? Post a request</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-8">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-16 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] text-sm text-[#55534E] dark:text-[#B5B7BB]">
                Unable to load FAQs right now. You can still browse{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/how-it-works')}
                  className="font-semibold text-[#A87919] dark:text-[#D8B45A] underline cursor-pointer"
                >
                  How WorldLeo Works
                </button>
                .
              </div>
            ) : (
              <div className="divide-y divide-[#D8D4CA] dark:divide-[#343941] border-y border-[#D8D4CA] dark:border-[#343941]">
                {filtered.map((item) => {
                  const isOpen = openId === item.id;
                  return (
                    <div key={item.id}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${item.id}`}
                        onClick={() => setOpenId(isOpen ? null : item.id)}
                        className="w-full py-4 sm:py-5 text-left flex items-start justify-between gap-4 group cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-mono text-[#A87919] dark:text-[#D8B45A]">
                            {item.category}
                          </div>
                          <div className="font-display text-base sm:text-lg font-semibold text-[#171717] dark:text-[#F1EFE8] group-hover:text-[#A87919] dark:group-hover:text-[#D8B45A] transition-colors">
                            {item.question}
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-[#55534E] dark:text-[#B5B7BB] shrink-0 mt-1 transition-transform duration-150 ${
                            isOpen ? 'rotate-180 text-[#A87919] dark:text-[#D8B45A]' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div
                          id={`faq-panel-${item.id}`}
                          className="pb-5 pr-8 text-sm text-[#55534E] dark:text-[#B5B7BB] leading-relaxed"
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
