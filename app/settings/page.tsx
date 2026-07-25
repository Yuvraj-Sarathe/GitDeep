"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { AI_PROVIDERS, AIProvider, PromptSize } from '@/lib/types';
import { ArrowLeft, Settings, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateSettings } = useStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [prevSettings, setPrevSettings] = useState(settings);

  // Sync localSettings when the store settings object is replaced externally.
  if (settings !== prevSettings) {
    setPrevSettings(settings);
    setLocalSettings(settings);
  }

  const handleProviderChange = (providerId: AIProvider) => {
    const info = AI_PROVIDERS.find(p => p.id === providerId);
    setLocalSettings(prev => ({
      ...prev,
      aiProvider: providerId,
      apiEndpoint: info?.defaultEndpoint || '',
      model: info?.defaultModel || '',
    }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    router.back();
  };

  const currentProvider = AI_PROVIDERS.find(p => p.id === localSettings.aiProvider) || AI_PROVIDERS[0];

  return (
    <div className="flex-1 min-h-[100dvh] bg-[#050505]">
      <div className="grain" />
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/')} className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] flex items-center justify-center premium-transition text-white/40 hover:text-white">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Settings className="w-4 h-4 text-white/40" /> Settings
              </h1>
            </div>
            <button
              onClick={handleSave}
              className="group relative overflow-hidden rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/20 premium-transition btn-press"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#58A6FF]/10 to-[#8957E5]/10 opacity-0 group-hover:opacity-100 premium-transition" />
              <div className="relative flex items-center gap-2 px-4 py-2">
                <span className="text-xs font-bold text-white/80 group-hover:text-white premium-transition uppercase tracking-wider">Save</span>
              </div>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {/* GitHub Token */}
          <div className="double-bezel">
            <div className="inner">
              <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">GitHub PAT Token (Optional)</label>
              <input 
                type="password"
                className="w-full px-3 py-3 bg-white/[0.02] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:border-[#58A6FF]/50 focus:bg-white/[0.04] premium-transition text-sm placeholder-white/20"
                value={localSettings.githubToken}
                onChange={e => setLocalSettings({...localSettings, githubToken: e.target.value})}
                placeholder="ghp_..."
              />
              <p className="text-[10px] text-white/30 mt-1.5">Needed for private repos or higher API rate limits.</p>
            </div>
          </div>

          {/* AI Provider */}
          <div className="double-bezel">
            <div className="inner">
              <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">AI Provider</label>
              <select 
                className="w-full px-3 py-3 bg-white/[0.02] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:border-[#58A6FF]/50 focus:bg-white/[0.04] premium-transition text-sm"
                value={localSettings.aiProvider}
                onChange={e => handleProviderChange(e.target.value as AIProvider)}
              >
                {AI_PROVIDERS.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#0A0A0F]">{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* API Key */}
          {currentProvider.needsKey && (
            <div className="double-bezel">
              <div className="inner">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-white/60 uppercase tracking-wider">API Key</label>
                  {currentProvider.docsUrl && (
                    <a href={currentProvider.docsUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#58A6FF] hover:underline flex items-center gap-1">
                      Get key <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input 
                  type="password"
                  className="w-full px-3 py-3 bg-white/[0.02] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:border-[#58A6FF]/50 focus:bg-white/[0.04] premium-transition text-sm placeholder-white/20"
                  value={localSettings.apiKey}
                  onChange={e => setLocalSettings({...localSettings, apiKey: e.target.value})}
                  placeholder={`Enter your ${currentProvider.label} key`}
                />
              </div>
            </div>
          )}

          {/* API Endpoint */}
          {currentProvider.needsEndpoint && (
            <div className="double-bezel">
              <div className="inner">
                <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">API Endpoint</label>
                <input 
                  type="text"
                  className="w-full px-3 py-3 bg-white/[0.02] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:border-[#58A6FF]/50 focus:bg-white/[0.04] premium-transition text-sm placeholder-white/20"
                  value={localSettings.apiEndpoint}
                  onChange={e => setLocalSettings({...localSettings, apiEndpoint: e.target.value})}
                  placeholder={currentProvider.defaultEndpoint || 'https://...'}
                />
              </div>
            </div>
          )}

          {/* Model */}
          <div className="double-bezel">
            <div className="inner">
              <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Model</label>
              <input 
                type="text"
                className="w-full px-3 py-3 bg-white/[0.02] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:border-[#58A6FF]/50 focus:bg-white/[0.04] premium-transition text-sm placeholder-white/20"
                value={localSettings.model}
                onChange={e => setLocalSettings({...localSettings, model: e.target.value})}
                placeholder={currentProvider.defaultModel || 'model-name'}
              />
              <p className="text-[10px] text-white/30 mt-1.5">Auto-filled from provider. You can type any model name — e.g. <span className="font-mono text-white/50">{currentProvider.defaultModel}</span></p>
            </div>
          </div>

          {/* Prompt Size */}
          <div className="double-bezel">
            <div className="inner">
              <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Prompt Size</label>
              <select
                className="w-full px-3 py-3 bg-white/[0.02] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:border-[#58A6FF]/50 focus:bg-white/[0.04] premium-transition text-sm"
                value={localSettings.promptSize}
                onChange={e => setLocalSettings({...localSettings, promptSize: e.target.value as PromptSize})}
              >
                <option value="full" className="bg-[#0A0A0F]">Full (in-depth) — for cloud models</option>
                <option value="small" className="bg-[#0A0A0F]">Small (compact) — for local/small models</option>
              </select>
              <p className="text-[10px] text-white/30 mt-1.5">Full = ~1200 token prompt for deep analysis. Small = ~400 tokens for limited context models.</p>
            </div>
          </div>

          {/* Filtered provider cards — clickable */}
          <div className="double-bezel">
            <div className="inner">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider block mb-3">Click a provider to select</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AI_PROVIDERS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProviderChange(p.id)}
                    className={`text-left px-3 py-2.5 rounded-xl border text-xs premium-transition ${
                      p.id === localSettings.aiProvider
                        ? 'border-[#58A6FF]/40 bg-[#58A6FF]/[0.06] shadow-[0_0_12px_rgba(88,166,255,0.06)]'
                        : 'border-white/[0.06] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="text-white/80 font-medium block">{p.label}</span>
                    <span className="text-white/30 text-[10px] font-mono mt-0.5 block truncate">{p.defaultModel}</span>
                    {p.id === localSettings.aiProvider && (
                      <span className="inline-block mt-1 text-[8px] uppercase tracking-wider text-[#58A6FF] font-bold">Active</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom save */}
          <div className="flex items-center justify-between pt-2 pb-12">
            <button onClick={() => router.push('/')} className="text-sm text-white/40 hover:text-white premium-transition">Cancel</button>
            <button
              onClick={handleSave}
              className="group relative overflow-hidden rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/20 premium-transition btn-press"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#58A6FF]/10 to-[#8957E5]/10 opacity-0 group-hover:opacity-100 premium-transition" />
              <div className="relative flex items-center gap-3 px-6 py-3">
                <span className="text-sm font-bold text-white/80 group-hover:text-white premium-transition">Save Settings</span>
                <div className="w-7 h-7 rounded-full bg-white/[0.06] group-hover:bg-white/[0.1] flex items-center justify-center premium-transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowLeft className="w-3.5 h-3.5 text-white/60 group-hover:text-white premium-transition rotate-135" />
                </div>
              </div>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
