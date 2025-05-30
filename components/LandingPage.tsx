import React from 'react';
import { ClockIcon, ReceiptIcon, RobotIcon } from './icons';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const heroStyle = {
    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAvNLJVAqGC1dA9kHZeZdTLLXQbXjUXGQRRdAMPUcumpIDqQEvcz5bvDrd1ECt2l-MCN4bflVekrrDhtDgKrshcskCJknhujD894xWMSehrcLzWjPXHG_nf_Xqpm3puSrZOARIgdsC2th84-xTchov0skIhSkr3hmAabXNiLKcFZ39SFr-B67BQZGLwPZqAECx2h5eVPpW6NFeL89N6ugeNi3Fdqe82VfQOlBKKpvBj7Xd8UzZnBPLqPGDZUkCKBhGII4U_BfVQt3Fc")',
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#10231c] dark justify-between group/design-root overflow-x-hidden"
      // Font family is globally set in index.html body
    >
      <div>
        <div className="@container">
          <div className="@[480px]:p-4">
            <div
              className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-start justify-end px-4 pb-10 @[480px]:px-10"
              style={heroStyle}
            >
              <div className="flex flex-col gap-2 text-left">
                <h1
                  className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]"
                >
                  LexiBill AI
                </h1>
                <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                  Clarity in Every Bill — Because Happy Clients Matter.
                </h2>
              </div>
              <button
                onClick={onGetStarted}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#019863] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]"
              >
                <span className="truncate">Get Started</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-10 px-4 py-10 @container">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h1
                className="text-white tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]"
              >
                Key Features
              </h1>
              <p className="text-white text-base font-normal leading-normal max-w-[720px]">Our system offers a range of features to enhance your billing process.</p>
            </div>
            <button
              // Add onClick handler or href if "Learn More" should navigate
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#019863] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] w-fit"
            >
              <span className="truncate">Learn More</span>
            </button>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-0">
            <div className="flex flex-1 gap-3 rounded-lg border border-[#2f6a55] bg-[#17352b] p-4 flex-col">
              <div className="text-white">
                <ClockIcon className="w-[24px] h-[24px]" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-white text-base font-bold leading-tight">Automated Time Tracking</h2>
                <p className="text-[#8ecdb7] text-sm font-normal leading-normal">Effortlessly track billable hours with our AI-powered time tracking.</p>
              </div>
            </div>
            <div className="flex flex-1 gap-3 rounded-lg border border-[#2f6a55] bg-[#17352b] p-4 flex-col">
              <div className="text-white">
                <ReceiptIcon className="w-[24px] h-[24px]" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-white text-base font-bold leading-tight">Smart Billing</h2>
                <p className="text-[#8ecdb7] text-sm font-normal leading-normal">Generate accurate invoices and manage billing with ease.</p>
              </div>
            </div>
            <div className="flex flex-1 gap-3 rounded-lg border border-[#2f6a55] bg-[#17352b] p-4 flex-col">
              <div className="text-white">
                <RobotIcon className="w-[24px] h-[24px]" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-white text-base font-bold leading-tight">AI Assistance</h2>
                <p className="text-[#8ecdb7] text-sm font-normal leading-normal">Get instant support and insights from our AI assistant.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="@container">
          <div className="flex flex-col justify-end gap-6 px-4 py-10 @[480px]:gap-8 @[480px]:px-10 @[480px]:py-20">
            <div className="flex flex-col gap-2 text-center">
              <h1
                className="text-white tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px] mx-auto" // Added mx-auto for centering
              >
                Ready to Transform Your Billing?
              </h1>
              <p className="text-white text-base font-normal leading-normal max-w-[720px] mx-auto"> {/* Added mx-auto */}
                Get in touch to learn how our system can benefit your legal practice.
              </p>
            </div>
            <div className="flex flex-1 justify-center">
              <div className="flex justify-center">
                <button
                  onClick={onGetStarted} // Make this button functional
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#019863] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] grow"
                >
                  <span className="truncate">Get Started</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Area */}
      <footer className="bg-[#10231c] text-center py-4">
        <p className="text-[#8ecdb7] text-xs">
          Built By: Thabiso
        </p>
        <div className="h-5 bg-[#10231c]"></div> {/* Original bottom padding */}
      </footer>
    </div>
  );
};

export default LandingPage;