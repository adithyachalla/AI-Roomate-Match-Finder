import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle } from "lucide-react";

const CompleteProfileModal = ({ isOpen, onCompleteProfile, onSkip }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10003]"
            onClick={onSkip}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[10004] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-card-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Gradient top bar */}
              <div className="h-1 bg-gradient-to-r from-primary to-accent-teal" />

              <div className="p-8 text-center">
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-primary/15 flex items-center justify-center">
                  <UserCircle className="w-9 h-9 text-primary" />
                </div>

                {/* Heading */}
                <h2 className="text-xl font-bold text-white mb-2">
                  Complete Your Student Profile
                </h2>

                {/* Description */}
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Your student profile is incomplete. Complete it to get matched
                  with compatible roommates and unlock the full experience.
                </p>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={onCompleteProfile}
                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                  >
                    Complete Profile
                  </button>
                  <button
                    onClick={onSkip}
                    className="w-full py-3 rounded-xl bg-white/10 text-slate-300 font-bold text-sm hover:bg-white/15 transition-all"
                  >
                    Skip for Now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CompleteProfileModal;
