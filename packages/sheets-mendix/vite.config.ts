import createViteConfig from '@univerjs/shared/vite';
import { univerPlugin } from '@univerjs/vite-plugin';
import pkg from './package.json';

export default ({ mode }) => {
    const newLocal = createViteConfig({}, {
        mode,
        pkg,
        features: {
            react: false,
            css: true,
            dom: true,
        },
    });
    newLocal.plugins.push(univerPlugin());
    return newLocal;
};
