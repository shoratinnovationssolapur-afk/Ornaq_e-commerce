import { motion } from "framer-motion";

export default function AuthLayout({ children, title, subtitle, image }) {
  return (
    <div className="flex min-h-[90vh] items-center justify-center bg-[#fffdf9] px-6 py-10 sm:p-12 md:p-16">
      <div className="flex w-full max-w-7xl flex-col overflow-hidden rounded-[3rem] border border-stone-100 bg-white shadow-2xl shadow-stone-200/50 lg:flex-row">
        {/* Left Side - Visual */}
        <div className="relative hidden w-full overflow-hidden bg-stone-900 lg:block lg:w-1/2">
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={image || "/src/assets/hero-banner.png"}
            className="h-full w-full object-cover object-center opacity-80"
            alt="ORNAQ Collection"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/20 to-transparent" />
          <div className="absolute bottom-16 left-16 right-16 text-white">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <p className="mb-4 text-xs font-black uppercase tracking-[0.4em] text-brand-400">Exclusive Luxury</p>
              <h2 className="text-4xl font-black leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
                {title}
              </h2>
              <p className="mt-6 text-lg font-medium leading-relaxed text-stone-300">
                {subtitle}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex w-full items-center justify-center px-8 py-16 sm:px-12 sm:py-20 lg:w-1/2 lg:px-20">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
