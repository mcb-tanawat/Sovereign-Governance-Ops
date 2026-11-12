import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Server, 
  Key, 
  Users, 
  Repeat, 
  Vault,
  ExternalLink
} from 'lucide-react';

export const GovernanceViewer: React.FC = () => {
  const pillars = [
    {
      num: '2.1',
      title: 'External Communication Gateway',
      icon: Server,
      color: 'text-emerald-400',
      tag: 'Read-Only Inbound',
      desc: 'การเชื่อมต่อไปยัง MintMe ดำเนินการในรูปแบบ Read-Only Inbound ผ่าน JSON-RPC (https://node1.mintme.com, Chain ID: 24734) เพื่อดึง Block Number และ Token Balance โดยไม่เปิดเผย Private Key ของ MeeChain Treasury เด็ดขาด มีระบบ Circuit Breaker ป้องกันระบบล่ม',
      status: 'Enforced'
    },
    {
      num: '2.2',
      title: 'T2PRAWANTA Holder Verification',
      icon: Key,
      color: 'text-cyan-400',
      tag: 'Zero-Trust Proof',
      desc: 'พิสูจน์ความเป็นเจ้าของกระเป๋าด้วย EIP-191 Cryptographic Nonce Challenge โดยผู้ใช้ลงนาม (Sign Message) เท่านั้น ห้ามขอ Private Key หรือ Seed Phrase และไม่ใช้เพียงภาพหน้าจอเพื่อป้องกันการแอบอ้าง',
      status: 'Enforced'
    },
    {
      num: '2.3',
      title: 'MeeChain Membership & Eligibility',
      icon: Users,
      color: 'text-purple-400',
      tag: 'Tier Governance',
      desc: 'กำหนดระดับสมาชิก (Standard ≥ 1,000 T2P, Contributor ≥ 10,000 T2P, Validator ≥ 100,000 T2P) พร้อมการจัดเก็บบันทึกหลักฐาน Audit Trail และ Hash ลายมือชื่อใน MeeChain Registry',
      status: 'Enforced'
    },
    {
      num: '2.4',
      title: 'MCB Exchange Program',
      icon: Repeat,
      color: 'text-amber-400',
      tag: 'Vesting & Cooldown',
      desc: 'คำนวณโควตาแลก MCB ตาม Conversion Ratio 1:0.25 (พร้อมโบนัสสำหรับ Tier สูงสุดถึง +30%) และควบคุมการปลดล็อกแบบ Linear Vesting (30 วัน) เพื่อป้องกันการเทขายสินทรัพย์',
      status: 'Enforced'
    },
    {
      num: '2.5',
      title: 'Economic Evidence & Treasury Control',
      icon: Vault,
      color: 'text-emerald-400',
      tag: 'Multi-Sig Vault',
      desc: 'แยกกระเป๋า Cold Storage สำรอง 7.85M MCB ออกจาก Hot Wallet จ่ายประจำวัน มีระบบ Automated Reconciliation Audit ตรวจสอบความถูกต้องระหว่าง Inbound Snapshot และการเบิกจ่าย 100%',
      status: 'Enforced'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <FileText className="w-4 h-4" />
          MeeChain Governance Specification
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          MeeChain External Asset Integration &amp; Membership Governance v1.0
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
          เอกสารข้อกำหนดหลักว่าด้วยการเชื่อมต่อสินทรัพย์ภายนอก (MintMe / T2PRAWANTA), 
          การรับรองสิทธิ์สมาชิก, และการควบคุมระบบเศรษฐกิจเหรียญ MCB อย่างมีอำนาจเอกเทศ
        </p>

        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-4 text-xs text-slate-400">
          <div><strong className="text-white">Status:</strong> Ratified &amp; Active</div>
          <div><strong className="text-white">File Location:</strong> <code className="text-emerald-400 font-mono">/docs/GOVERNANCE_v1.0.md</code></div>
          <div><strong className="text-white">Scope:</strong> Inbound Bridge &amp; Sovereign Treasury</div>
        </div>
      </div>

      {/* Five Pillars Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          The 5 Pillars of MeeChain Governance
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.num} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      PART {pillar.num}
                    </span>
                    <Icon className={`w-5 h-5 ${pillar.color}`} />
                    <h3 className="text-base font-bold text-white">{pillar.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {pillar.tag}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {pillar.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sovereign Mandate Box */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl">
        <h3 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>คำประกาศอธิปไตยทางเศรษฐกิจ (Sovereign Economic Mandate)</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          "ตลาดภายนอก (MintMe DEX) ทำหน้าที่เป็นช่องทางส่งข้อมูลและตลาดซื้อขายอิสระ แต่สิทธิ์สมาชิก, 
          ระดับการมีส่วนร่วม, การรับรองหลักฐาน, และการจัดสรรเหรียญ MCB ภายใน MeeChain 
          เป็นอำนาจตัดสินใจเด็ดขาดของระบบ MeeChain Ops และคณะกรรมการกำกับดูแลของเครือข่ายเท่านั้น"
        </p>
      </div>
    </div>
  );
};
