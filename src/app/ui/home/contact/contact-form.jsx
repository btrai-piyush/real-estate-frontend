"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { contactApi } from "@/api/api";

const INITIAL_FORM_STATE = {
  name: "",
  email: "",
  phone: "",
  company: "",
  subject: "",
  message: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizePayload = (form) => ({
  name: form.name.trim(),
  email: form.email.trim(),
  phone: form.phone.trim(),
  company: form.company.trim(),
  subject: form.subject.trim(),
  message: form.message.trim(),
});

const validateForm = (form) => {
  const normalized = normalizePayload(form);

  if (!normalized.name) return "Please enter your name.";
  if (!normalized.email) return "Please enter your email.";
  if (!EMAIL_REGEX.test(normalized.email)) return "Please enter a valid email address.";
  if (!normalized.phone) return "Please enter your phone number.";
  if (!normalized.subject) return "Please enter a subject.";
  if (!normalized.message) return "Please enter your message.";

  return "";
};

export default function ContactForm() {
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationMessage = validateForm(form);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      await contactApi.sendUserMessage(normalizePayload(form));
      toast.success("Your message has been sent successfully.");
      setForm(INITIAL_FORM_STATE);
    } catch (error) {
      toast.error(error?.message || "Unable to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase =
    "w-full rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-slate-800 placeholder:text-slate-500 outline-none transition focus:border-[#eb6666] focus:ring-4 focus:ring-[#eb6666]/15";

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)] md:p-7">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-[32px]">
          Send Us A Message
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
          Fill out the form and our team will get back to you as soon as possible.
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            <input
              className={inputBase}
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              disabled={isSubmitting}
            />

            <input
              className={inputBase}
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={isSubmitting}
            />

            <input
              className={inputBase}
              type="tel"
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
              disabled={isSubmitting}
            />

            <input
              className={inputBase}
              type="text"
              name="company"
              placeholder="Company"
              value={form.company}
              onChange={handleChange}
              disabled={isSubmitting}
            />

            <input
              className={`${inputBase} md:col-span-2`}
              type="text"
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleChange}
              disabled={isSubmitting}
            />

            <textarea
              className={`${inputBase} md:col-span-2 min-h-[180px] resize-y py-4`}
              name="message"
              placeholder="Your Message"
              value={form.message}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-w-[170px] items-center justify-center rounded-xl bg-[#eb6666] px-9 py-3.5 text-lg font-bold text-white transition hover:bg-[#e35858] focus:outline-none focus:ring-4 focus:ring-[#eb6666]/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}