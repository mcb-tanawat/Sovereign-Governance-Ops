# MeeChain External Asset Integration & Membership Governance v1.0

## 1. System Philosophy (ปรัชญาและหลักการของระบบ)
MeeChain เป็นระบบเศรษฐกิจและระบบการกำกับดูแลแบบเอกเทศ (**Sovereign Governance & Economic System**) 
สินทรัพย์ภายนอก เช่น `T2PRAWANTA` บนเครือข่าย MintMe DEX ถือเป็น **"Inbound Evidence" (หลักฐานขาเข้า)** เท่านั้น

MeeChain มีอำนาจเด็ดขาดในการ:
1. ตรวจสอบสิทธิ์ (Verification & Proof of Holding)
2. กำหนดระดับสมาชิก (Membership Tiers & Eligibility)
3. ควบคุมและบริหารคลังสินทรัพย์ (Treasury Vault & Reserve) ของเหรียญ `MCB`
4. ป้องกันการแทรกแซงหรือการสับสนระหว่างตลาด DEX ภายนอกกับนโยบายเศรษฐกิจภายใน

---

## 2. Five Pillars of Governance (หลักการ 5 ประการ)

### 2.1 External Communication Gateway (Inbound Only)
- การเชื่อมต่อไปยัง MintMe จะดำเนินการในรูปแบบ **Read-Only Inbound** ผ่าน JSON-RPC (`https://node1.mintme.com`, Chain ID: 24734) หรือ Public Node Snapshot เท่านั้น
- ข้อมูลที่ดึงเข้ามา: Block Number, Transaction State, และ Token Balance (`balanceOf`)
- **Treasury Isolation:** ไม่อนุญาตให้เปิดเผย ส่งต่อ หรือเชื่อมโยง Private Key ของ MeeChain Treasury Vault ไปยังบริการภายนอกโดยเด็ดขาด
- **Circuit Breaker:** หาก RPC หรือเครือข่ายภายนอกหยุดชะงัก ระบบ MeeChain ยังคงทำงานได้ต่อเนื่องผ่าน Internal Snapshot Cache

### 2.2 T2PRAWANTA Holder Verification (Zero-Trust Proof)
- ใช้กลไก **Cryptographic Proof-of-Ownership** มาตรฐาน EIP-191 / Web3 `personal_sign`:
  1. ระบบ MeeChain สร้าง Challenge แบบไดนามิก (Dynamic Nonce พร้อม Timestamp และ Session ID)
  2. ผู้ถือครองลงนาม (Sign Message) ด้วยกุญแจกระเป๋าต้นทางที่ถือเหรียญ T2PRAWANTA
  3. ระบบตรวจสอบความถูกต้องผ่าน `ecrecover` เพื่อพิสูจน์ว่าเป็นผู้ถือกุญแจจริง
  4. **Strict Security:** ห้ามขอ Seed Phrase หรือ Private Key เด็ดขาด และไม่พึ่งพาเพียงภาพถ่ายหน้าจอ

### 2.3 MeeChain Membership & Eligibility (โครงสร้างสมาชิกและสิทธิ์)
ระดับสถานะสมาชิก (Membership Lifecycle):
- **PENDING:** ยื่น Wallet Address และรอการยืนยัน Signature
- **TIER 1 (STANDARD HOLDER):** ถือครอง T2PRAWANTA ขั้นต่ำ 1,000 หน่วย ได้สิทธิ์สมาชิกทั่วไปและติดตามสถานะ
- **TIER 2 (CONTRIBUTOR):** ถือครอง T2PRAWANTA ตั้งแต่ 10,000 หน่วยขึ้นไป ได้สิทธิ์เข้าร่วม Contribution Mining
- **TIER 3 (VALIDATOR & GOVERNANCE):** ถือครองตั้งแต่ 100,000 หน่วยขึ้นไป ได้สิทธิ์โหวตนโยบายและสิทธิ์แลกเปลี่ยนระดับ VIP
- **SUSPENDED / REVOKED:** ระงับสิทธิ์หากพบพฤติกรรม Sybil Attack หรือโอนถ่ายหลักทรัพย์ออกนอกเงื่อนไข snapshot

### 2.4 MCB Exchange Program (โปรแกรมแลกเปลี่ยนเหรียญ MCB)
- การจัดสรรโควตา MCB อิงตาม Snapshot Balance และสัดส่วน Conversion Ratio ที่กำหนดตามรอบ (Epoch)
- **Vesting & Cooldown:** นำระบบ Linear Vesting (30 - 90 วัน) มาใช้เพื่อป้องกันการเทขายรวดเดียวสู่กระดาน
- **Epoch Quota Cap:** จำกัดเพดานแลกเปลี่ยนสูงสุดต่อรอบ เพื่อรักษาสมดุลของปริมาณเงินในระบบ MCB

### 2.5 Economic Evidence & Treasury Control (การควบคุมคลังและหลักฐาน)
- บันทึกทุกคำขอแลกเปลี่ยนลง **MeeChain Audit Ledger** พร้อม Signature Hash, MintMe Block Height และ Nonce
- การเบิกจ่าย MCB จาก Treasury Hot/Cold Vault ต้องผ่านการ Reconcile ยอดอัตโนมัติ 100%
- แยกบัญชี Reserve:
  - **Contribution Mining Pool:** สำหรับผู้มีส่วนร่วมสร้างสรรค์เครือข่าย
  - **Exchange Liquidity Pool:** สำหรับโปรแกรมแลกเปลี่ยนสมาชิก
  - **Ecosystem Development Fund:** สำหรับพัฒนา MeeChain Core
