import React from 'react';
import { ShieldAlert, Check, Lock, Play } from 'lucide-react';
import type { UserProfile, UserLevel, UserRole, UserGoal } from '../types';

interface ProfileScreenProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onStartShift: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onUpdateProfile,
  onStartShift,
}) => {
  const isComplete =
    profile.level !== null && profile.role !== null && profile.goal !== null;

  return (
    <main className="w-full max-w-[480px] mx-auto px-4 py-6 flex flex-col space-y-6">
      {/* Narrative Badge */}
      <div className="flex items-center space-x-2">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#172030] text-[#ffd8af] border border-[#212a3b]">
          <span>Tek hikâye</span>
          <span>·</span>
          <span>3 karar</span>
          <span>·</span>
          <span>2 son</span>
        </span>
      </div>

      {/* Main Title & Teaser */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#dae2f9]">
          Acilde 60 Dakika
        </h1>
        <p className="text-base text-[#d6c3b1] leading-relaxed">
          Kayıt ekranları donuyor. Bekleyenler artıyor. Bu gece nöbet sende.
        </p>
      </div>

      {/* Hospital Infrastructure Alert Card */}
      <div className="p-4 rounded-lg bg-[#131c2c] border border-[#212a3b] flex items-start space-x-3.5">
        <div className="p-2 rounded bg-[#ffb454]/10 text-[#ffb454] shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-mono font-semibold tracking-wider text-[#ffd8af] uppercase">
            HASTANE ALTYAPI SİSTEMİ
          </div>
          <p className="text-sm text-[#dae2f9] leading-relaxed">
            Eşzamanlı kayıt istekleri kapasiteyi aşıyor. Kayıt akışı yavaşlıyor.
          </p>
        </div>
      </div>

      {/* 3 Profile Questions */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isComplete) onStartShift();
        }}
        className="space-y-5"
        aria-label="Mühendislik Profili Formu"
      >
        {/* Question 1: Level */}
        <fieldset className="p-4 rounded-lg bg-[#172030] border border-[#212a3b] space-y-3">
          <legend className="w-full">
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono font-semibold text-[#ffd8af]">
                01. Seviyen?
              </span>
              <span className="text-xs font-mono text-[#d6c3b1] bg-[#131c2c] px-2 py-0.5 rounded">
                Zorunlu
              </span>
            </div>
          </legend>

          <div
            className="grid grid-cols-2 gap-2.5 pt-1"
            data-cy="profile-level"
          >
            {[
              { id: 'beginner', label: 'Yeni başlayan' },
              { id: 'experienced', label: 'Deneyimli' },
            ].map((item) => {
              const isSelected = profile.level === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onUpdateProfile({ level: item.id as UserLevel })}
                  className={`min-h-[48px] px-3 py-2.5 rounded-lg border text-base font-medium flex items-center justify-between transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd8af] ${
                    isSelected
                      ? 'bg-[#2c3546] border-[#ffb454] text-[#ffd8af] ring-1 ring-[#ffb454]'
                      : 'bg-[#131c2c] border-[#2c3546] text-[#dae2f9] hover:bg-[#212a3b]'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="truncate">{item.label}</span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#ffb454] text-[#734600] flex items-center justify-center shrink-0 ml-1.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Question 2: Role */}
        <fieldset className="p-4 rounded-lg bg-[#172030] border border-[#212a3b] space-y-3">
          <legend className="w-full">
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono font-semibold text-[#ffd8af]">
                02. Rolün?
              </span>
              <span className="text-xs font-mono text-[#d6c3b1] bg-[#131c2c] px-2 py-0.5 rounded">
                Zorunlu
              </span>
            </div>
          </legend>

          <div
            className="grid grid-cols-2 gap-2.5 pt-1"
            data-cy="profile-role"
          >
            {[
              { id: 'developer', label: 'Geliştirici' },
              { id: 'tester', label: 'Test mühendisi' },
            ].map((item) => {
              const isSelected = profile.role === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onUpdateProfile({ role: item.id as UserRole })}
                  className={`min-h-[48px] px-3 py-2.5 rounded-lg border text-base font-medium flex items-center justify-between transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd8af] ${
                    isSelected
                      ? 'bg-[#2c3546] border-[#ffb454] text-[#ffd8af] ring-1 ring-[#ffb454]'
                      : 'bg-[#131c2c] border-[#2c3546] text-[#dae2f9] hover:bg-[#212a3b]'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="truncate">{item.label}</span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#ffb454] text-[#734600] flex items-center justify-center shrink-0 ml-1.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Question 3: Goal */}
        <fieldset className="p-4 rounded-lg bg-[#172030] border border-[#212a3b] space-y-3">
          <legend className="w-full">
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono font-semibold text-[#ffd8af]">
                03. Öğrenme hedefin?
              </span>
              <span className="text-xs font-mono text-[#d6c3b1] bg-[#131c2c] px-2 py-0.5 rounded">
                Zorunlu
              </span>
            </div>
          </legend>

          <div
            className="grid grid-cols-3 gap-2 pt-1"
            data-cy="profile-goal"
          >
            {[
              { id: 'architecture', label: 'Mimari' },
              { id: 'testing', label: 'Test' },
              { id: 'security', label: 'Veri güvenliği' },
            ].map((item) => {
              const isSelected = profile.goal === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onUpdateProfile({ goal: item.id as UserGoal })}
                  className={`min-h-[48px] px-2 py-2.5 rounded-lg border text-base font-medium flex flex-col items-center justify-center text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd8af] ${
                    isSelected
                      ? 'bg-[#2c3546] border-[#ffb454] text-[#ffd8af] ring-1 ring-[#ffb454]'
                      : 'bg-[#131c2c] border-[#2c3546] text-[#dae2f9] hover:bg-[#212a3b]'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="text-sm leading-tight">{item.label}</span>
                  {isSelected && (
                    <span className="mt-1 w-4 h-4 rounded-full bg-[#ffb454] text-[#734600] flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Start Shift Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!isComplete}
            data-cy="start"
            className={`w-full min-h-[48px] px-4 py-3 rounded-lg font-bold text-base flex items-center justify-center space-x-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd8af] ${
              isComplete
                ? 'bg-[#ffb454] text-[#734600] hover:bg-[#ffa733] shadow-lg shadow-[#ffb454]/10 cursor-pointer active:scale-[0.99]'
                : 'bg-[#212a3b] text-[#9f8e7d] border border-[#2c3546] cursor-not-allowed opacity-75'
            }`}
          >
            {isComplete ? (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Nöbete başla</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Nöbete başla</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer Info */}
      <p className="text-xs font-mono text-center text-[#9f8e7d] pt-2">
        Yaklaşık 5–8 dakika. Tüm olaylar ve kayıtlar kurgusaldır.
      </p>
    </main>
  );
};
