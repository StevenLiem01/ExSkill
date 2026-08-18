---
version: alpha
name: ExSkill Design System
description: Sistem desain resmi untuk ExSkill, platform pertukaran keahlian mahasiswa.
colors:
  primary: "#00DF9A"
  primary-hover: "#00C285"
  secondary: "#6366F1"
  neutral: "#0F172A"
  surface: "#1E293B"
  on-surface: "#F8FAFC"
  error: "#FF5B4F"
typography:
  headline-display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -0.02em
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  label-sm:
    fontFamily: Geist_Mono
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.05em
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
rounded:
  sm: 4px
  md: 8px
  lg: 16px
  xl: 24px
  full: 9999px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.lg}"
    padding: 12px
---

## Overview

ExSkill adalah platform *peer-to-peer* pertukaran keahlian yang dirancang khusus untuk mahasiswa yang tech-savvy, bersemangat, dan kolaboratif. Antarmuka utama berfokus pada estetika "Dark Tech" (Mode Gelap) yang dipadukan dengan aksen neon yang mencolok. Desain harus terasa imersif, modern, dan memberikan kesan pertumbuhan *(growth)* serta inovasi.

## Colors

Palet warna kita berakar pada latar belakang gelap yang elegan dipadukan dengan aksen neon yang sangat kontras.

- **Primary (Cyber Mint - #00DF9A):** Warna neon hijau/mint yang melambangkan kesepakatan, keberhasilan bertukar keahlian, dan energi positif. Digunakan untuk tombol aksi utama (Call to Action).
- **Secondary (Indigo - #6366F1):** Warna ungu kebiruan untuk elemen pendukung dan interaksi sekunder.
- **Neutral (Slate 900 - #0F172A):** Latar belakang utama aplikasi. 
- **Surface (Slate 800 - #1E293B):** Warna untuk kartu profil dan kontainer *dashboard*.

## Typography

Tipografi ExSkill mengandalkan sistem *font* bawaan Next.js untuk performa dan kesan modern.

- **Headlines & Body:** Menggunakan font **Geist** (sans-serif) untuk keterbacaan tinggi dan tampilan antarmuka yang bersih.
- **Labels & Data:** Menggunakan **Geist Mono** untuk elemen teknis seperti skor keahlian, tanggal, atau log aktivitas.

## Layout

Tata letak menggunakan ruang bernapas *(whitespace)* yang luas untuk menghindari beban kognitif pada mahasiswa. Kita menggunakan sistem kartu *(card-based)* dengan *padding* internal yang terstandardisasi (menggunakan token `lg` atau 24px).

## Elevation & Depth

Kedalaman visual TIDAK dicapai melalui *drop shadow* tradisional berwarna hitam pekat. 
Kita menggunakan teknik **Glassmorphism**:
1. Latar belakang kartu transparan putih (`bg-white/5` atau `bg-slate-800/50`).
2. Efek *blur* latar belakang (`backdrop-blur-md`).
3. Batas tepi sangat tipis untuk mempertegas bentuk kaca (`border border-white/10`).

## Shapes

Meskipun ini adalah platform teknis, bentuk melengkung yang ramah digunakan untuk menyeimbangkan antarmuka gelap. 
Sebagian besar kartu besar dan tombol utama menggunakan **sudut melengkung yang mulus** (`rounded-lg` atau `rounded-2xl` di Tailwind) untuk kesan *modern SaaS*.

## Do's and Don'ts

- **Do** gunakan warna Primary (Cyber Mint) dengan hemat, HANYA untuk tombol aksi terpenting di sebuah halaman.
- **Don't** menggunakan *background* putih terang sebagai latar belakang utama halaman.
- **Do** pastikan efek *glassmorphism* (*backdrop blur*) selalu dipadukan dengan *border* transparan tipis agar kartu tidak menyatu dengan latar belakang.
- **Don't** menggunakan lebih dari dua jenis *font* dalam satu halaman.