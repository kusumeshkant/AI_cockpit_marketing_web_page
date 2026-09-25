/**
 * The Framer Motion feature bundle, isolated in its own module so
 * `LazyMotion` can pull it in as a separate async chunk.
 *
 * `domAnimation` covers everything the site needs: enter/exit animations,
 * `whileInView`, scroll-linked transforms and springs. `domMax` would only add
 * layout animations and drag, neither of which appear on this page.
 */
export { domAnimation as default } from 'motion/react';
