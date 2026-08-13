'use client';

import React from 'react';
import { MessageCircle, Mail, MapPin, Phone, Clock } from 'lucide-react';
import InstagramIcon from '@/components/ui/InstagramIcon';

export default function ContactPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919664209989';
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/houseofnf.in';

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold block mb-2">
            ATELIER CONTACT
          </span>
          <h1 className="font-serif text-4xl font-bold text-stone-900">Connect with House of NF</h1>
          <p className="text-xs text-stone-500 mt-2 font-light">We are here to assist with custom styling, orders, and inquiries.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-stone-200 p-8 space-y-6">
            <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-200 pb-3">Atelier Information</h3>

            <div className="space-y-4 text-xs text-stone-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
                <div>
                  <strong className="block text-stone-900">Flagship Atelier:</strong>
                  <span>Designer Lane, Main Fashion Boulevard, New Delhi - 110001, India</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
                <div>
                  <strong className="block text-stone-900">Phone Support:</strong>
                  <span>+91 96642 09989</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
                <div>
                  <strong className="block text-stone-900">Client Care Email:</strong>
                  <span>thehouseofnf@gmail.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
                <div>
                  <strong className="block text-stone-900">Hours:</strong>
                  <span>Monday - Saturday: 10:00 AM - 7:30 PM IST</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#141312] text-white p-8 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold block mb-2">
                INSTANT CONNECT
              </span>
              <h3 className="font-serif text-2xl font-bold mb-4">Direct Order Channels</h3>
              <p className="text-xs text-stone-400 font-light leading-relaxed mb-6">
                Prefer to order directly via message? Connect with our fashion consultants on WhatsApp or Instagram for instant response.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white font-semibold text-xs uppercase tracking-widest py-3.5 px-4 flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-stone-900 hover:bg-[#C5A059] text-white hover:text-stone-950 font-semibold text-xs uppercase tracking-widest py-3.5 px-4 flex items-center justify-center gap-2 border border-stone-700 transition-all"
              >
                <InstagramIcon className="w-4 h-4" />
                DM on Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
