import { motion } from 'framer-motion';
import './WordmarkReveal.css';

export default function WordmarkReveal() {
    const letters = "FITBOT".split("");

    return (
        <div className="wordmark-wrap">
            <div className="wordmark-line">
                {letters.map((letter, i) => (
                    <motion.span
                        key={i}
                        className="wordmark-letter"
                        initial={{ opacity: 0, filter: 'blur(8px)', y: 14 }}
                        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                        transition={{
                            duration: 0.7,
                            delay: 0.15 + i * 0.09,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                    >
                        {letter}
                    </motion.span>
                ))}
                <motion.span
                    className="wordmark-glow-bloom"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: [0, 0.9, 0.4], scale: [0.6, 1.4, 1.15] }}
                    transition={{ duration: 1.1, delay: 0.15 + letters.length * 0.09, ease: 'easeOut' }}
                />
            </div>
            <motion.p
                className="wordmark-sub"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.3 }}
            >
                fitness&#8202;&#8202;&#8202;&#8202;&mdash;&#8202;&#8202;&#8202;&#8202;rag
            </motion.p>
        </div>
    );
}
