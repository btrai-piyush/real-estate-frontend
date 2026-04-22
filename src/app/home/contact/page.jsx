'use client';

import Image from "next/image";
import ContactForm from "@/app/ui/home/contact/contact-form";
import ContactUs from "@/app/ui/home/contact/contact-us";
import { nunito } from "@/app/ui/fonts";

export default function ContactPage() {
  return (
    <div className={`${nunito.className} bg-[#f3f4f6] text-slate-900`}>
      <section className="relative h-[220px] overflow-hidden md:h-[260px]">
        <Image
          src="/waiting-room.jpg"
          alt="Contact page banner"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,39,0.68)_0%,rgba(17,24,39,0.62)_100%)]" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1200px] items-center px-6 md:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">Contact Us</h1>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 md:py-14">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2.15fr)_minmax(0,1fr)] lg:gap-8">
        <ContactForm />
        <ContactUs />
        </div>
      </section>
    </div>
  );
}