import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen premium-bg">
      <div className="relative mx-auto w-full max-w-2xl px-5 py-16 md:px-8 md:py-24">
        <div className="text-center">
          {/* Header */}
          <div className="mx-auto mb-3 h-[1.5px] w-10 bg-[#C9A15B]"></div>
          <h1 
            className="mb-3 font-serif text-4xl font-medium tracking-tight text-[#0F172A] md:text-5xl" 
            style={{ 
              fontFamily: 'Georgia, "Times New Roman", serif',
              textShadow: '0 0.3px 0.3px rgba(0,0,0,0.1)'
            }}
          >
            Welcome to Namely
          </h1>
          <div className="mx-auto mb-6 h-[1.5px] w-10 bg-[#C9A15B]"></div>
          
          <p className="mb-12 text-base leading-relaxed tracking-wide text-[#6A6A6A] md:text-lg">
            This platform powers guest experience insights for hospitality.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="group inline-flex items-center justify-center rounded-2xl border border-[#C9A15B]/40 bg-gradient-to-b from-[#0F172A] to-[#1B2436] px-8 py-4 text-base font-medium tracking-wide text-white shadow-[0_4px_15px_rgba(0,0,0,0.15)] transition-all duration-200 hover:from-[#152238] hover:to-[#1E293B] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:ring-offset-2 focus:ring-offset-[#F6F3EE]"
            >
              Manager Login
            </Link>
            
            <Link
              href="#"
              className="group inline-flex items-center justify-center rounded-2xl border border-[#E9E4DA] bg-white px-8 py-4 text-base font-medium tracking-wide text-[#1F2933] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:bg-[#FAFAF8] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#C9A15B] focus:ring-offset-2 focus:ring-offset-[#F6F3EE]"
            >
              Scan a QR code to access guest feedback
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
