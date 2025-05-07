import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

interface EmailModalProps {
    open: boolean;
    onClose: () => void;
    onSend: () => void;
    emailFormData: { to: string[]; cc: string[]; message: string };
    onAddEmail: (e: React.KeyboardEvent<HTMLInputElement>, type: 'to' | 'cc') => void;
    onRemoveEmail: (index: number, type: 'to' | 'cc') => void;
    onMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    sending: boolean;
    userSubscription: { tier: string };
    goToSubscription: () => void;
}

const EmailModal: React.FC<EmailModalProps> = ({
    open,
    onClose,
    onSend,
    emailFormData,
    onAddEmail,
    onRemoveEmail,
    onMessageChange,
    sending,
    userSubscription,
    goToSubscription,
}) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 m-4 animate-modal-slide-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Send Invoice
                    </h2>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="h-9 w-9 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Button>
                </div>
                {userSubscription.tier === "pro" ? (
                    <>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Recipients
                                </label>
                                <div className="min-h-[42px] flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400">
                                    {emailFormData.to.map((email, index) => (
                                        <div
                                            key={`to-${index}`}
                                            className="inline-flex items-center bg-white dark:bg-gray-800 rounded-md px-2 py-1 text-sm border border-gray-200 dark:border-gray-700"
                                        >
                                            <span className="mr-1">{email}</span>
                                            <button
                                                type="button"
                                                onClick={() => onRemoveEmail(index, "to")}
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    <input
                                        type="text"
                                        onKeyDown={(e) => onAddEmail(e, "to")}
                                        placeholder="Add email address..."
                                        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    CC
                                </label>
                                <div className="min-h-[42px] flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:border-yellow-400 dark:focus-within:border-yellow-400">
                                    {emailFormData.cc.map((email, index) => (
                                        <div
                                            key={`cc-${index}`}
                                            className="inline-flex items-center bg-white dark:bg-gray-800 rounded-md px-2 py-1 text-sm border border-gray-200 dark:border-gray-700"
                                        >
                                            <span className="mr-1">{email}</span>
                                            <button
                                                type="button"
                                                onClick={() => onRemoveEmail(index, "cc")}
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    <input
                                        type="text"
                                        onKeyDown={(e) => onAddEmail(e, "cc")}
                                        placeholder="Add CC..."
                                        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Message
                                </label>
                                <textarea
                                    value={emailFormData.message}
                                    onChange={onMessageChange}
                                    rows={4}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-yellow-400 dark:focus:border-yellow-400 focus:outline-none text-sm resize-none"
                                    placeholder="Add a message to your invoice email..."
                                ></textarea>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={onSend}
                                disabled={sending || emailFormData.to.length === 0}
                                className="disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {sending ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Mail size={16} />
                                        <span>Send Invoice</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 p-4 rounded-lg">
                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>This feature is exclusive to Pro users.</span>
                        </div>
                        <Button
                            onClick={goToSubscription}
                            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                        >
                            Upgrade to Pro
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailModal; 