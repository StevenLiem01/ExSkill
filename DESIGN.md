---
version: alpha
name: ExSkill Design System
description: Sistem desain resmi untuk ExSkill, mengusung tema AI-Driven SaaS bergaya Cyber-Neon.
colors:
  primary: "#8B5CF6"
  primary-hover: "#A78BFA"
  secondary: "#D946EF"
  neutral: "#0B061A"
  surface: "#1A1528"
  surface-glass: "rgba(255, 255, 255, 0.03)"
  on-surface: "#F8FAFC"
  error: "#EF4444"
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
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: 12px
---

## Overview

ExSkill mengadopsi identitas visual **"AI-Driven SaaS"** atau **"Cyber-Neon"**. Antarmuka ini dirancang untuk memberikan kesan futuristik, canggih, dan premium layaknya platform startup kelas dunia. Penggunaan warna dasar ungu sangat gelap (*Midnight Purple*) yang dipadukan dengan pendaran cahaya neon *(glow)* memberikan pengalaman imersif dan eksklusif bagi mahasiswa IT, desainer, dan *developer*.

## Colors

Palet warna bergeser dari nuansa hitam pekat/abu-abu ke arah spektrum ungu yang sangat gelap *(Deep Midnight)* dengan aksen neon bersinar.

- **Primary (Neon Purple - #8B5CF6):** Warna aksi utama yang mencolok. Digunakan untuk tombol utama, sorotan *(highlight)*, dan pendaran *(glow)* di belakang elemen penting.
- **Secondary (Magenta - #D946EF):** Warna aksen pendukung untuk memberikan gradasi atau dimensi ekstra pada grafik, latar belakang *mesh*, dan ikon.
- **Neutral (Midnight Dark - #0B061A):** Latar belakang utama aplikasi yang sangat gelap (mendekati hitam namun berbasis ungu/biru gelap), memberikan kontras maksimal untuk efek *glow*.
- **Surface (Deep Purple Surface - #1A1528):** Warna dasar untuk kartu dan kontainer sebelum diberi efek *glassmorphism*.
- **Surface Glass:** Warna semi-transparan (`rgba(255, 255, 255, 0.03)`) untuk menciptakan efek kaca UI yang mewah.

## Typography

Tipografi mempertahankan sistem *font* bawaan Next.js untuk memberikan kesan *tech-savvy*.

- **Headlines & Body:** Menggunakan font **Geist** (sans-serif) untuk keterbacaan tinggi dan tampilan antarmuka geometris yang bersih.
- **Labels & Data:** Menggunakan **Geist Mono** untuk elemen teknis, skor *Trust*, grafik analitik, dan log aktivitas.

## Layout

Sistem tata letak menggunakan ruang bernapas *(whitespace)* yang tertata rapi. Komponen dikelompokkan ke dalam kartu besar dengan *padding* luas (24px - 32px) agar antarmuka tidak terasa sesak dan informasi dapat dipindai dengan cepat oleh pengguna.

## Elevation & Depth

Kedalaman visual TIDAK menggunakan *drop shadow* bayangan hitam tradisional. Kedalaman dicapai melalui perpaduan **Glassmorphism** dan **Glow Effects**:
1. **Glassmorphism:** Kartu menggunakan latar belakang transparan tipis (`bg-white/5`), efek *blur* pada latar belakang (`backdrop-blur-xl`), dan batas tepi super tipis (`border border-white/10`).
2. **Neon Glow (Pendaran):** Elemen interaktif utama dan latar belakang *dashboard* memiliki bayangan berpendar *(drop shadow neon)* atau gradasi memendar untuk menciptakan dimensi futuristik.

## Shapes

Bentuk elemen mengutamakan kesan mengalir *(fluid)* dan presisi:
- Kartu data dan panel *dashboard* menggunakan **sudut melengkung yang tegas** (`rounded-2xl` atau `16px`).
- Tombol aksi utama cenderung berbentuk pil *(pill-shaped)* atau bulatan penuh (`rounded-full`) untuk memberikan kontras geometris terhadap kartu.

## Do's and Don'ts

- **Do** gunakan efek *glow* (pendaran) HANYA pada elemen yang paling penting (seperti grafik utama atau tombol *Submit*) untuk menghindari kelelahan mata *(eye strain)*.
- **Don't** gunakan warna hitam murni (`#000000`) untuk *background*; selalu gunakan *Midnight Purple* yang sangat gelap.
- **Do** pertahankan *border* 1px putih transparan (`white/10`) pada setiap kartu *Glassmorphism* untuk mempertegas batas antarmuka.
- **Don't** menumpuk lapisan kaca lebih dari dua tingkat (misalnya kartu di dalam kartu transparan) agar visibilitas teks tetap optimal.