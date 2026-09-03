'use client';

import React from 'react';
import Link from 'next/link';
import { ZohoServiceMeta } from '@/lib/zoho';
import { Users, Target, HelpCircle, CreditCard, ArrowRight, ShieldCheck } from 'lucide-react';

interface ZohoAppCardProps {
  service: ZohoServiceMeta;
  userRole: string;
}

const iconMap: Record<string, any> = {
  Users,
  Target,
  HelpCircle,
  CreditCard,
};

export default function ZohoAppCard({ service, userRole }: ZohoAppCardProps) {
  const Icon = iconMap[service.iconName] || Users;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg ${service.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center">
            <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
            Authorized
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          {service.name}
        </h3>
        <p className="text-xs font-medium text-blue-600 mb-2">{service.category}</p>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {service.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Role: <span className="font-semibold text-slate-600">{userRole}</span>
        </span>
        <Link
          href={`/services/${service.code}`}
          className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors group-hover:translate-x-0.5 transition-transform"
        >
          Access Application
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>
    </div>
  );
}
